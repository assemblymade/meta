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
            name: product.name,
            body: product.pitch,
            created_at: product.created_at,
            founder_preference: true
          )

          product.team_memberships.each do |membership|
            Heart.create!(
              created_at: membership.created_at,
              user: membership.user,
              heartable: idea.news_feed_item
            )
          end

          idea.greenlight! if idea.should_greenlight?
        rescue => e
          puts "Failed to make product for #{product.slug}"
          puts e.inspect
        end
      end
    end
  end

  def rand_words(min=5, max=7)
    (0..rand(min..max)).map{
      ('a'..'z').to_a.shuffle[0,rand(2..8)].join
    }.join(' ')
  end
end
