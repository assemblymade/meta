namespace :dashboard do

  task :all => [:disable_ar_log, :dau, :dac, :dap, :monthlies, :entities, :growth, :queues_counts]

  task :entities => :environment do
    number 'ideas.count', Product.count
    number 'presales.count', Preorder.count
    number 'presales.sum', Preorder.sum(:amount) / 100.0
    number 'presales.avg.user', average(Preorder.group(:user_id).average(:amount).values) / 100.0
    number 'users.count', User.count

    helpful = Product.find_by!(slug:'helpful')
    sparkline 'wips.created', helpful.wips.group('date(created_at)').order('date(created_at)').count('*')
    sparkline 'wips.awarded', helpful.tasks.won.group('date(closed_at)').order('date(closed_at)').count('*')

    list 'users.active.recent', User.where('last_request_at is not null').order('last_request_at DESC').limit(20).select(:username).map(&:username)

    leaderboard 'users.presales.recent', recent_presales
  end

  task :growth => :environment do
    users_signedup_this_week  = User.where('created_at >= ?', 7.days.ago).count
    number 'users.growth.weekly', (users_signedup_this_week.to_f / User.count.to_f) * 100

    wips_created_this_week = Wip.where('created_at >= ?', 7.days.ago).count
    wip_events_created_this_week = Event.where('created_at >= ?', 7.days.ago).count
    votes_created_this_week = Vote.where(voteable_type: 'Wip').where('created_at >= ?', 7.days.ago).count
    weekly_product_enhancements = wips_created_this_week + wip_events_created_this_week + votes_created_this_week
    number 'wpe.count', weekly_product_enhancements
    number 'wpe.percent', (weekly_product_enhancements.to_f / (Wip.count + Event.count).to_f * 100)
  end

  task :dau => :environment do
    sparkline 'dau.last_week',
      Metrics::DailyActives.in_week(Date.today - 1.week).pluck(:created_at, :count).map{|date, count| [date + 1.week, count]}
    sparkline 'dau.this_week',
      Metrics::DailyActives.in_week(Date.today).pluck(:created_at, :count)
  end

  task :monthlies do
    mau = User.where("last_request_at >= ?", 30.days.ago).count
    number "mau.count", mau
    number "mau.percent", (mau.to_f / User.count.to_f * 100)

    mac = Metrics::Contributors.active_between(30.days.ago, Date.today)
    number "mac.count", mac
    number "mac.percent", (mac.to_f / mau.to_f * 100)

    map = Metrics::Partners.active_between(30.days.ago, Date.today)
    number "map.count", map
    number "map.percent", (map.to_f / mac.to_f * 100)
  end

  task :dac => :environment do
    sparkline 'dac.last_week',
      Metrics::Contributors.in_week(Date.today - 1.week).map{|date, count| [date + 1.week, count]}
    sparkline 'dac.this_week',
      Metrics::Contributors.in_week(Date.today)
  end

  task :dap => :environment do
    sparkline 'dap.last_week',
      Metrics::Partners.in_week(Date.today - 1.week).map{|date, count| [date + 1.week, count]}
    sparkline 'dap.this_week',
      Metrics::Partners.in_week(Date.today)
  end

  task :queues_counts => :environment do
    stats = Sidekiq::Stats.new
    leaderboard 'queues.counts', [stats.queues]
  end

  task :disable_ar_log => :environment do
    ActiveRecord::Base.logger = nil
  end

  def recent_presales
    Preorder.order('created_at DESC').limit(20).map {|ps| { "#{ps.user.name}" => ps.amount / 100.0} }
  end

  def average(array)
    array.reduce(:+).to_f / array.size
  end

  def sparkline(key, entries)
    number key, entries.map{|date, count| {'timestamp' => date.to_time.to_i, 'number' => count} }
  end

  def number(key, value)
    handle leftronic.number "asm.#{key}", value
  end

  def leaderboard(key, entries)
    handle leftronic.leaderboard "asm.#{key}", entries
  end

  def list(key, entries)
    handle leftronic.list "asm.#{key}", entries
  end

  def handle(result)
    # Great jerb on the api leftronic...
    if result != 'Success!'
      puts "error: #{result}"
    end
  end

  def leftronic
    if ENV['LEFTRONIC_KEY']
      @leftronic ||= Leftronic.new(ENV['LEFTRONIC_KEY'])
    else
      @leftronic = FakeLeftronic.new
    end
  end

  class FakeLeftronic
    def number(key, value)
      puts "DEBUG #{key}=#{value}"
      'Success!'
    end

    def leaderboard(key, entries)
      puts "DEBUG #{key} #{entries.inspect}"
      'Success!'
    end

    def list(key, entries)
      puts "DEBUG #{key} #{entries.inspect}"
      'Success!'
    end
  end
end
