namespace :metrics do
  namespace :asm do
    def active_user(type, user, at)
      puts "#{type} #{at.iso8601} – #{user.username}"
      Workers::AsmTrackUniqueWorker.new.perform 'user.active', user.id, at
    end

    # run this hourly, track actives in PST
    task :store_daily_actives => :environment do
      pst = ActiveSupport::TimeZone["Pacific Time (US & Canada)"]
      at = pst.now

      start_at = (at - 1.hour).beginning_of_day.utc
      end_at = (at - 1.hour).end_of_day.utc

      daily_actives = Metrics::DailyActives.where(created_at: end_at).first_or_initialize
      daily_actives.count = User.where('last_request_at > ?', start_at).count
      daily_actives.save!
    end

    task :rebuild => :environment do
      ActiveRecord::Base.logger = nil
      Product.find_by(slug: 'asm').metrics.find_by(name: 'user.active').uniques.delete_all

      [Product, Wip, Event, Vote].each do |klass|
        klass.joins(:user).where('is_staff is not true').find_each do |o|
          active_user klass, o.user, o.created_at
        end
      end

      User.where('is_staff is not true').find_each do |o|
        active_user User, o, o.created_at
      end
    end
  end
  
  task :created => :environment do
    data = by_month do |date|
      total = User.where("created_at >= date(?) and created_at <= date(?)", date.beginning_of_month, date.end_of_month).count
      [Date::MONTHNAMES[date.month], total]
    end
    data.each do |month, total|
      puts "#{month}: #{total} New Users"
    end
  end
  
  task :total_users => :environment do
    data = by_month do |date|
      total = User.where("created_at <= date(?)", date.end_of_month).count
      [Date::MONTHNAMES[date.month], total]
    end
    data.each do |month, total|
      puts "#{month}: #{total} Total Users"
    end
  end
  
  task :mau => :environment do
    mau = Metrics::DailyActives.active_between(Date.today.beginning_of_month, Date.today.end_of_month).pluck('sum(count)').first
    puts "Total MAU: #{mau}"
    puts "Total %: #{(mau.to_f / User.count.to_f)}"
  end

  desc "Monthly Active Contributors - People who created wips and comment"
  task :mac => :environment do
    data = by_month do |date|
      total = Metrics::Contributors.active_between(date.beginning_of_month, date.end_of_month)
      [Date::MONTHNAMES[date.month], total]
    end
    data.each do |month, total|
      puts "#{month}: #{total} Monthly Active Contributors"
    end
  end

  desc "Monthly Total Contributions - create wips and add comments"
  task :mtc => :environment do
    data = by_month do |date|
      total =  Event.joins(:user).where('users.is_staff is false').where("events.created_at >= date(?) and events.created_at <= date(?)", date.beginning_of_month, date.end_of_month).size
      total = total + Wip.joins(:user).where('users.is_staff is false').where("wips.created_at >= date(?) and wips.created_at <= date(?)", date.beginning_of_month, date.end_of_month).size
      [Date::MONTHNAMES[date.month], total]
    end
    data.each do |month, total|
      puts "#{month}: #{total} Monthly Total Contributions"
    end
  end

  desc "Monthly Active Partners - People who won tasks"
  task :map => :environment do
    data = by_month do |date|
      total = Metrics::Partners.active_between(date.beginning_of_month, date.end_of_month)
      [Date::MONTHNAMES[date.month], total]
    end
    data.each do |month, total|
      puts "#{month}: #{total} Monthly Active Partners"
    end
  end

  desc "Monthly Total Winnings - Actual work accepted & won"
  task :mtw => :environment do
    data = by_month do |date|
      total = Task.joins(winning_event: :user).where('users.is_staff is false').where("closed_at >= date(?) and closed_at <= date(?)", date.beginning_of_month, date.end_of_month).won.size
      [Date::MONTHNAMES[date.month], total]
    end
    data.each do |month, total|
      puts "#{month}: #{total} Monthly Total Winnings"
    end
  end

  desc "Monthly Products Developed - Products being worked on"
  task :mpd => :environment do
    data = by_month do |date|
      total = Task.joins(winning_event: :user).where('users.is_staff is false').where("closed_at >= date(?) and closed_at <= date(?)", date.beginning_of_month, date.end_of_month).won.collect(&:product_id).uniq.size
      [Date::MONTHNAMES[date.month], total]
    end
    data.each do |month, total|
      puts "#{month}: #{total} Monthly Products Developed"
    end
  end

  desc "Monthly Products Started"
  task :mps => :environment do
    data = by_month do |date|
      total = Product.where("created_at >= date(?) and created_at <= date(?)", date.beginning_of_month, date.end_of_month).size
      [Date::MONTHNAMES[date.month], total]
    end
    data.each do |month, total|
      puts "#{month}: #{total} Products Started"
    end
  end

  task :all => ['metrics:total_users', 'metrics:created', 'metrics:mau','metrics:mac','metrics:mtc','metrics:map','metrics:mtw','metrics:mpd','metrics:mps']

  def by_month
    data = []
    ["1-nov-2013", "1-dec-2013", "1-jan-2014", "1-feb-2014", "1-mar-2014", "1-apr-2014", "1-may-2014"].each do |month|
      data << yield(Date.parse(month))
    end
    data
  end
end