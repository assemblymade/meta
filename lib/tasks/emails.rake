namespace :emails do

  task newsletter: :environment do
    next unless Newsletter.unpublished.any?

    Newsletter.next_unpublished.publish!(if ENV['EMAIL_TEST_MODE']
      User.where(is_staff: true)
    else
      User.mailable
    end)
  end

  task :stale_wips => :environment do
    user = User.find_by(username: 'chrislloyd')
    ProductMailer.delay(queue: 'mailer').stale_wips(user.id)
  end

  task :stale_allocated_tasks => :environment do
    Wip::Worker.dead.each(&:abandon!)
    Wip::Worker.mia.each(&:remind!)
  end

  task :congratulate_on_signups => :environment do
    Product.find(Subscriber.where('created_at > ?', 1.day.ago).group(:product_id).count.keys).each do |product|
      number_of_signups = Subscriber.where('created_at > ? and product_id = ?', 1.day.ago, product.id).count

      next if number_of_signups < 10

      ProductMailer.delay(queue: 'mailer').congratulate_on_signups(product.id, number_of_signups)
    end
  end

  task :featured_wips => :environment do
    Watching.where(
      watchable_id: [
        "de18b612-c487-4d3e-abec-19a231fecda9", # barrtr
        "ee7615bc-53c4-49b5-9c7b-680866ed8487", # coderwall
        "99774a98-3059-4290-921a-2f25f48e093b", # helpful
        "44cbd334-4f33-45c5-b522-3569b275ffd6"  # snapshot-io
      ],

      unwatched_at: nil
    ).each do |watching|
      user = watching.user

      next if EmailLog.sent_to(user.id, :featured_wips_take_two).any?

      EmailLog.log_send user.id, :featured_wips_take_two do
        UserMailer.delay(queue: 'mailer').featured_wips(user)
      end
    end
  end

  task :featured_work => :environment do
    Product.all.each do |product|
      CoreTeamMailer.delay(queue: 'mailer').featured_work(product)
    end
  end

  task :featured_work_apology => :environment do
    Product.all.each do |product|
      active_core_team = (product.core_team + [product.user]).uniq.compact.delete_if { |c|
        c.last_request_at.nil? || c.last_request_at < 30.days.ago
      }

      active_core_team.each do |team_member|
        UserMailer.delay(queue: 'mailer').featured_work_apology(product, team_member)
      end
    end
  end

  task :joined_team_no_work_yet => :environment do
    User.find(TeamMembership.where('created_at < ?', 1.day.ago).group(:user_id).count.keys).each do |user|
      if Task.won_by(user).empty? &&                          # no bounties won
         Event::ReviewReady.where(user_id: user.id).empty? && # no work submitted
         Wip::Worker.where(user_id: user.id).empty?           # no work started

         # we'll only send this once per user. Even though they join multiple products
         unless EmailLog.sent_to(user.id, :joined_team_no_work_yet).any?
           EmailLog.log_send user.id, :joined_team_no_work_yet do
             membership = user.team_memberships.order(created_at: :desc).first

             next if membership.product.core_team?(user)

             UserMailer.delay(queue: 'mailer').joined_team_no_work_yet membership.id
           end
         end
      end
    end
  end

  task :joined_team_no_introduction_yet => :environment do
    TeamMembership.where('created_at < ?', 1.day.ago).where(bio: nil).each do |membership|
      EmailLog.send_once(membership.user.id, :joined_team_no_introduction_yet) do
        UserMailer.delay.joined_team_no_introduction_yet(membership.id)
      end
    end
  end


  namespace :digests do

    task :daily => :environment do
      users = User.where(mail_preference: 'daily')
      users.each do |user|
        DeliverUnreadEmail.perform_async(user.id)
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

  desc "Send out new balance report emails"
  task :balance => :environment do
    ProfitReport.group(:end_at).count.keys.each do |end_at|
      user_ids = User::BalanceEntry.joins(:profit_report).
        where('profit_reports.end_at = ?', end_at).
        group(:user_id).count.keys

      key = "profit_report #{end_at.strftime('%b %Y')}"
      puts key
      User.where(id: user_ids).each do |user|
        EmailLog.send_once(user.id, key) do
          balance = User::Balance.new(user)

          if !user.sponsored?
            balance_entries = User::BalanceEntry.joins(:profit_report).
                  where('profit_reports.end_at = ?', end_at).
                  where(user_id: user.id)

            earnings = balance_entries.sum(:earnings)

            if earnings > 0
              puts "  #{user.username} $#{"%.02f" % (earnings / 100.0)}"

              UserBalanceMailer.delay(queue: 'mailer').new_balance(balance_entries.pluck(:id))
            end
          end
        end
      end
    end
  end

  task :pitch_week_intro => :environment do
    User.where(id: Product.group(:user_id).count.keys).each do |user|
      if product = user.most_interesting_product
        EmailLog.send_once(user.id, :pitch_week_intro) do
          puts "#{user.username.ljust(20)} #{product.name}"
          TextMailer.delay.pitch_week_intro(user.id, product.id)
        end
      end
    end
  end

  desc "Alert users to upcoming bounty holding"
  task :bounty_holding_incoming => :environment do
    workers = {}

    Task.includes(:wip_workers).where('wips.closed_at is null').each do |task|
      if task.workers.count > 0
        task.workers.each do |worker|
          if workers[worker.id]
            workers[worker.id] << task.id
          else
            workers[worker.id] = [task.id]
          end
        end
      end
    end

    workers.each do |worker_id, tasks|
      if tasks.count > 1
        products = []
        tasks.map do |task|
          t = Task.find(task)
          products << t.product.slug
        end

        if products.uniq.count > 1
          puts "#{worker_id} #{tasks.count}"
          EmailLog.send_once(worker_id, :bounty_holding_incoming_take2) do
            UserMailer.delay.bounty_holding_incoming_take2(worker_id, tasks)
          end
        end
      end

      next
      EmailLog.send_once(worker_id, :bounty_holding_incoming) do
        UserMailer.delay.bounty_holding_incoming(worker_id, tasks)
      end
    end
  end

  desc "Greenlight and reject team building products"
  task team_building: :environment do
    expired = Product.team_building.where('started_team_building_at < ?', 30.days.ago)

    successes, failures = *expired.partition do |product|
      product.bio_memberships_count >= 10
    end

    successes.each do |product|
      product.greenlight!

      TeamBuildingMailer.success(product.id).deliver
    end

    failures.each do |product|
      product.reject!

      TeamBuildingMailer.failure(product.id).deliver
    end
  end

  desc "Send heart emails"
  task hearts_received: :environment do
    EmailCampaigns::HeartsReceived.new.process!.each do |user_id, heart_ids|
      HeartMailer.hearts_received(user_id, heart_ids).deliver
    end
  end

  desc "Suggest Bounties to Recently Inactive"
  task inactive_suggestions: :environment do
    recently_inactive_users = User.recently_inactive
    recently_inactive_users.each do |user|
      if user.top_bountys.count > 0 and user.top_products.count > 0
        the_key = "suggestion" + Time.now.strftime("%d%b%Y")
        EmailLog.send_once(user.id, the_key) do
          SuggestionMailer.delay(queue: 'mailer').create(user.id)
        end
      end
    end
  end

end
