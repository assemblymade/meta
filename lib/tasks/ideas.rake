namespace :ideas do
  task seed: :environment do
    raise "You're not in the development environment" unless Rails.env.development?
    30.times {
      i = User.sample.ideas.create(name: rand_words, body: rand_words(20, 50))
      i.add_mark(%(social mobile game marketplace SaaS iOS android utility).split.sample)
    }
    Idea.all.each do |idea|
      rand(0..10).times {
        idea.news_feed_item.comments.create(user: User.sample, body: rand_words(20, 50))
      }
    end
  end

  task migrate_products: :environment do
    Product.find_each do |product|
      if product.idea.nil?
        begin
          idea = Idea.create_with_discussion(
            product.user,
            name: product.pitch,
            body: product.description,
            created_at: product.created_at,
            flagged_at: product.flagged_at,
            founder_preference: true,
            product_id: product.id
          )

          if idea.body.nil? || idea.body.empty?
            idea.update(flagged_at: Time.now)
            next
          end

          if idea.name.split(' ').count >= 20
            idea.update(flagged_at: Time.now)
            next
          end

          hearts = (product.votes + product.watchings + product.team_memberships).map do |h|
            next unless h.user_id
            { user_id: h.user_id, created_at: h.created_at }
          end

          hearts.each do |heart|
            begin
              next if Heart.where(user_id: heart[:user_id], heartable_id: idea.news_feed_item.id).any?
              next if heart[:user_id].nil?
              h = idea.news_feed_item.hearts.create!(
                user_id: heart[:user_id]
              )

              h.update_column('created_at', heart[:created_at])
            rescue => e
              puts "Heart failed #{e}"
            end
          end

          idea.greenlight! if idea.should_greenlight?
          idea.greenlight! if product.greenlit_at

          idea.news_feed_item.update_column('last_commented_at', product.created_at)

          if idea.hearts_count == 0
            idea.update(flagged_at: Time.now)
          end
        rescue => e
          puts "Failed to make idea for #{product.slug}"
          puts e.inspect
        end
      end
    end
  end

  task unmigrate_products: :environment do
    Idea.find_each do |idea|
      if (idea.product_id != nil) || idea.news_feed_item.comments.count == 0
        idea.news_feed_item.hearts.each(&:delete)
        idea.news_feed_item.comments.delete_all
        idea.news_feed_item.delete
        idea.delete
      end
    end
  end

  def rand_words(min=5, max=7)
    (0..rand(min..max)).map{
      ('a'..'z').to_a.shuffle[0,rand(2..8)].join
    }.join(' ')
  end
end
