namespace :dashboard do
  task :all => [:disable_ar_log, :dau, :dac, :dap, :monthlies, :entities, :growth, :queues_counts]

  task :entities => :environment do
    dash = DashboardReporter.new
    dash.number 'ideas.count', Product.count
    dash.number 'presales.count', Preorder.count
    dash.number 'presales.sum', Preorder.sum(:amount) / 100.0
    dash.number 'presales.avg.user', dash.average(Preorder.group(:user_id).average(:amount).values) / 100.0
    dash.number 'users.count', User.count

    helpful = Product.find_by!(slug:'helpful')
    dash.sparkline 'wips.created', helpful.wips.group('date(created_at)').order('date(created_at)').count('*')
    dash.sparkline 'wips.awarded', helpful.tasks.won.group('date(closed_at)').order('date(closed_at)').count('*')

    dash.list 'users.active.recent', User.where('last_request_at is not null').order('last_request_at DESC').limit(20).select(:username).map(&:username)

    dash.leaderboard 'users.presales.recent', recent_presales
  end

  task :growth => :environment do
    dash = DashboardReporter.new
    users_signedup_this_week  = User.where('created_at >= ?', 7.days.ago).count
    dash.number 'users.growth.weekly', (users_signedup_this_week.to_f / User.count.to_f) * 100

    wips_created_this_week = Wip.where('created_at >= ?', 7.days.ago).count
    wip_events_created_this_week = Event.where('created_at >= ?', 7.days.ago).count
    votes_created_this_week = Vote.where(voteable_type: 'Wip').where('created_at >= ?', 7.days.ago).count
    weekly_product_enhancements = wips_created_this_week + wip_events_created_this_week + votes_created_this_week
    dash.number 'wpe.count', weekly_product_enhancements
    dash.number 'wpe.percent', (weekly_product_enhancements.to_f / (Wip.count + Event.count).to_f * 100)
  end

  task :dau => :environment do
    dash = DashboardReporter.new
    dash.sparkline 'dau.last_week',
      Metrics::DailyActives.in_week(Date.today - 1.week).pluck(:created_at, :count).map{|date, count| [date + 1.week, count]}
    dash.sparkline 'dau.this_week',
      Metrics::DailyActives.in_week(Date.today).pluck(:created_at, :count)
  end

  task :monthlies do
    dash = DashboardReporter.new
    mau = User.where("last_request_at >= ?", 30.days.ago).count
    dash.number "mau.count", mau
    dash.number "mau.percent", (mau.to_f / User.count.to_f * 100)

    mac = Metrics::Contributors.active_between(30.days.ago, Date.today)
    dash.number "mac.count", mac
    dash.number "mac.percent", (mac.to_f / mau.to_f * 100)

    map = Metrics::Partners.active_between(30.days.ago, Date.today)
    dash.number "map.count", map
    dash.number "map.percent", (map.to_f / mac.to_f * 100)
  end

  task :dac => :environment do
    dash = DashboardReporter.new
    dash.sparkline 'dac.last_week',
      Metrics::Contributors.in_week(Date.today - 1.week).map{|date, count| [date + 1.week, count]}
    dash.sparkline 'dac.this_week',
      Metrics::Contributors.in_week(Date.today)
  end

  task :dap => :environment do
    dash = DashboardReporter.new
    dash.sparkline 'dap.last_week',
      Metrics::Partners.in_week(Date.today - 1.week).map{|date, count| [date + 1.week, count]}
    dash.sparkline 'dap.this_week',
      Metrics::Partners.in_week(Date.today)
  end

  task :queues_counts => :environment do
    dash = DashboardReporter.new
    stats = Sidekiq::Stats.new
    dash.leaderboard 'queues.counts', [stats.queues]
  end

  task :disable_ar_log => :environment do
    ActiveRecord::Base.logger = nil
  end
  
  def recent_presales
    Preorder.order('created_at DESC').limit(20).map {|ps| { "#{ps.user.name}" => ps.amount / 100.0} }
  end
end
