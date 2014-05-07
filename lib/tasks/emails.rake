namespace :emails do

  task newsletter: :environment do
    User.all.each do |user|
      NewsletterMailer.delay.march_fifth_twenty_fourteen(user.id)
    end
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

      users = if ENV['EMAIL_TEST_MODE']
        User.where(is_staff: true)
      else
        User.where(mail_preference: 'daily')
      end.to_a

      client = ReadRaptorClient.new

      users.each do |user|
        Rails.logger.debug("Attempting to send out recap to #{user.username} out of #{users.count} total users")
        unread_articles = ReadRaptorClient.new.unread_entities(user.id)

        # Mark all articles as read
        unless ENV['EMAIL_TEST_MODE']
          ReadRaptorSerializer.deserialize_articles(unread_articles).each do |entity|
            client.get(ReadraptorTracker.new(entity, user.id).url)
          end
        end

        # Only send out if they have any unread articles
        next if unread_articles.empty?

        DigestMailer.delay.daily(user.id, unread_articles)

        Rails.logger.info "daily digest email: #{user.email} unread: #{unread_articles}"
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
