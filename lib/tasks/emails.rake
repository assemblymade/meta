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

  task :joined_team_no_work_yet => :environment do
    User.find(TeamMembership.where('created_at < ?', 1.day.ago).group(:user_id).count.keys).each do |user|
      if Task.won_by(user).empty? &&                          # no bounties won
         Event::ReviewReady.where(user_id: user.id).empty? && # no work submitted
         Wip::Worker.where(user_id: user.id).empty?           # no work started

         # we'll only send this once per user. Even though they join multiple products
         unless EmailLog.sent_to(user.id, :joined_team_no_work_yet).any?
           EmailLog.log_send user.id, :joined_team_no_work_yet do
             membership = user.team_memberships.order(created_at: :desc).first
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

          if !user.sponsored? && balance.available_earnings > 0
            puts "  #{user.username} $#{"%.02f" % (balance.available_earnings / 100.0)}"
            balance_entry_ids = User::BalanceEntry.joins(:profit_report).
                  where('profit_reports.end_at = ?', end_at).
                  where(user_id: user.id).
                  pluck(:id)

            UserBalanceMailer.delay(queue: 'mailer').new_balance(balance_entry_ids)
          end
        end
      end
    end
  end
end
