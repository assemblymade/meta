namespace :emails do

  task newsletter: :environment do
    next unless Newsletter.unpublished.any?

    Newsletter.next_unpublished.publish!(if ENV['EMAIL_TEST_MODE']
      User.where(is_staff: true)
    else
      User.all
    end)
  end

  task :stale_wips => :environment do
    user = User.find_by(username: 'chrislloyd')
    ProductMailer.delay.stale_wips(user.id)
  end

  task :stale_allocated_tasks => :environment do
    Wip::Worker.dead.each(&:abandon!)
    Wip::Worker.mia.each(&:remind!)
  end

  task :stake_updated => :environment do
    TransactionLogEntry.with_cents.group(:user_id, :product_id).sum(:cents).each do |(user_id, product_id), cents|
      user = User.find(user_id)
      product = Product.find(product_id)
      if cents > 0
        Rails.logger.info("email=stake_updated user=#{user.username} product=#{product.slug} cents=#{cents}")
        StakeMailer.delay.coin_balance(product_id, user_id)
      end
    end
  end

  namespace :digests do

    task :daily => :environment do

      client = ReadRaptorClient.new
      users = User.where(mail_preference: 'daily')
      users = [User.find_by(username: 'whatupdave')]
      users.each do |user|

        unread_article_ids = ReadRaptorClient.new.undelivered_articles(user.id)
        puts "#{user.username} unread_article_ids #{unread_article_ids}"
        unread_articles = ReadRaptorSerializer.deserialize_articles(unread_article_ids)

        # Only send out if they have any unread articles
        next if unread_articles.empty?

        # Mark all articles with email tag as read
        unread_articles.each do |entity|
          client.get(ReadraptorTracker.new(ReadRaptorSerializer.serialize_entities(entity, :email).first, user.id).url)
        end

        DigestMailer.delay.daily(user.id, unread_article_ids)
        Rails.logger.info "digest email=#{user.email} unread=#{unread_article_ids}"
      end
    end

    task :weekly => :environment do
      # If it's Thursday and there's a newsletter to send
      next unless Date.today.thursday? && Newsletter.available.any?
      newsletter = Newsletter.available.first

      # Find people who haven't un-subscribed
      users = if ENV['EMAIL_TEST_MODE']
        User.where(is_staff: true)
      else
        User.where.not(mail_preference: 'never')
      end

      # And send them a newsletter
      newsletter.email_to_users!(users)
    end

  end
end
