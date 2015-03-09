namespace :metrics do
  namespace :growth do
    task :weekly_influence => :environment do
      range = ENV['weeks'].to_i
      range = 10 if range == 0
      (1..range).each do |number_of_weeks|
        current = Activity.where.not(type: Activities::Follow).where("created_at < ?", 1.day.ago).count + Heart.where("created_at < ?", 1.day.ago).count
        original = Activity.where.not(type: Activities::Follow).where("created_at < ?", number_of_weeks.weeks.ago).count + Heart.where("created_at < ?", number_of_weeks.weeks.ago).count
        result = (((current.to_f / original.to_f) ** (1 / number_of_weeks.to_f)) - 1).to_f
        puts "#{number_of_weeks}: #{(result.to_f * 100).round(2)} w/w growth"
      end
    end

    task :monthly_influence => :environment do
      range = ENV['months'].to_i
      range = 12 if range == 0
      (1..range).each do |number_of_months|
        current = Activity.where.not(type: Activities::Follow).where("created_at < ?", 1.day.ago).count + Heart.where("created_at < ?", 1.day.ago).count
        original = Activity.where.not(type: Activities::Follow).where("created_at < ?", number_of_months.months.ago - 1.day).count + Heart.where("created_at < ?", number_of_months.months.ago - 1.day).count
        result = (((current.to_f / original.to_f) ** (1 / number_of_months.to_f)) - 1).to_f
        puts "#{number_of_months}: #{(result.to_f * 100).round(2)} m/m growth"
      end
    end

    task :weekly_signups => :environment  do
      (1..52).each do |number_of_weeks|
        current  = User.where("created_at < ?", 1.day.ago).count
        original = User.where("created_at < ?", number_of_weeks.weeks.ago).count
        result = (((current.to_f / original.to_f) ** (1 / number_of_weeks.to_f)) - 1).to_f
        puts "#{number_of_weeks}: #{(result.to_f * 100).round(2)} w/w user growth"
      end
    end
  end

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

  task :mau2 => :environment do
    last_month = 2.month.ago
    # User.where("created_at < ?", Date.today.beginning_of_month).where("last_request_at >= ?", last_month.beginning_of_month)
    mau   = User.where("created_at <= ?", last_month.end_of_month).where("last_request_at >= ?", last_month.beginning_of_month).count
    total = User.where("created_at <= ?", last_month.end_of_month).count

    puts "#{last_month.beginning_of_month} > #{last_month.end_of_month}"
    puts "MAU RAW: #{mau}"
    puts "Total RAW: #{total}"
    puts "MAU: #{mau.to_f / total.to_f}"
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
      total = Award.joins(:winner).where('users.is_staff is false').where("awards.created_at >= date(?) and awards.created_at <= date(?)", date.beginning_of_month, date.end_of_month).count
      [Date::MONTHNAMES[date.month], total]
    end
    data.each do |month, total|
      puts "#{month}: #{total} Monthly Total Winnings"
    end
  end

  desc "Monthly Products Developed - Products being worked on"
  task :mpd => :environment do
    data = by_month do |date|
      total = Award.
        joins(:winner).
        joins(:wip).
        where('users.is_staff is false').
        where("awards.created_at >= date(?) and awards.created_at <= date(?)",
            date.beginning_of_month, date.end_of_month).
        group('wips.product_id').count.size
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

  desc "Monthly Coins Minted"
  task :mcm => :environment do
    include ActionView::Helpers::NumberHelper
    data = by_month do |date|
      total = TransactionLogEntry.minted.where("created_at >= date(?) and created_at <= date(?)", date.beginning_of_month, date.end_of_month).sum(:cents)
      [Date::MONTHNAMES[date.month], total]
    end
    data.each do |month, total|
      puts [month.rjust(10), number_with_delimiter(total).rjust(15), 'Coins minted'].join(' ')
    end
  end

  desc "Dollars earned and dollars withdrawn"
  task :dollars => :environment do
    include ActionView::Helpers::NumberHelper
    include CurrencyHelper
    data = by_month do |date|
      revenue = ProfitReport.where(end_at: date.end_of_month).sum(:revenue)
      earned = ProfitReport.where(end_at: date.end_of_month).map(&:payable).reduce(0, :+)

      all_earnings = ProfitReport.where('end_at <= ?', date.end_of_month).
        map(&:user_balances).flatten.reject{|entry| entry.user.staff? }.map(&:earnings).reduce(0, :+)
      all_withdrawals = User::Withdrawal.
        where("created_at <= date(?)", date.end_of_month).
        sum(:total_amount)

      held = all_earnings - all_withdrawals

      paid = User::Withdrawal.
        where("created_at > date(?) and created_at <= date(?)", date.beginning_of_month, date.end_of_month).
        sum(:total_amount)

      [Date::MONTHNAMES[date.month], [revenue, earned, held, paid]]
    end
    puts [' '.rjust(10), 'Revenue'.rjust(15), 'Earned'.rjust(15), 'Held'.rjust(15), 'Withdrawn'.rjust(15)].join(' ')
    totals = [0, 0, 0, 0]
    data.each do |month, (revenue, earned, held, paid)|
      puts [month.rjust(10), currency(revenue).rjust(15), currency(earned).rjust(15), currency(held).rjust(15), currency(paid).rjust(15)].join(' ')
      totals = [totals[0] + revenue, totals[1] + earned, held, totals[3] + paid]
    end
    puts [' '.rjust(10), '------------'.rjust(15), '------------'.rjust(15), '------------'.rjust(15), '------------'.rjust(15)].join(' ')
    puts [' '.rjust(10), currency(totals[0]).rjust(15), currency(totals[1]).rjust(15), currency(totals[2]).rjust(15), currency(totals[3]).rjust(15)].join(' ')
  end

  task :all => ['metrics:total_users', 'metrics:created', 'metrics:mau','metrics:mac','metrics:mtc','metrics:map','metrics:mtw','metrics:mpd','metrics:mps']

  desc "Sparklines of Top Product Activity"
  task :spark => :environment do
    products = Activity.where('created_at > ?', 1.month.ago).map { |a| [a.find_product.name, a.created_at.at_beginning_of_week.to_i] }
    groups = products.group_by(&:first).map { |p, a| [p, a.map(&:last)] }
    counts = groups.map { |p, a| [p, Range.new(1.month.ago.at_beginning_of_week.to_i, Time.now.at_beginning_of_week.to_i).step(1.week).map { |d| a.count { |a| a == d } }] }.sort_by { |d, a| -a.sum }
    counts.each do |name, counts|
      puts name
      puts Sparkr.sparkline(counts)
      puts
    end
  end

  def by_month
    data = []
    ["1-nov-2013", "1-dec-2013", "1-jan-2014", "1-feb-2014", "1-mar-2014", "1-apr-2014", "1-may-2014", "1-jun-2014", "1-jul-2014", "1-aug-2014", "1-sep-2014", "1-oct-2014", "1-nov-2014"].each do |month|
      data << yield(Date.parse(month))
    end
    data
  end

  desc "Number of users created each week"
  task :signups => :environment do
    not_cumulative_totals = User.group("DATE_TRUNC('week', created_at)").order("DATE_TRUNC('week', created_at) ASC").count
    cumulative_totals = User.pluck("DISTINCT DATE_TRUNC('week', created_at), COUNT(users.*) OVER (ORDER BY DATE_TRUNC('week', created_at) ASC)").to_h

    totals = not_cumulative_totals.merge(cumulative_totals) do |_, not_cumulative, cumulative|
      [not_cumulative, cumulative]
    end

    puts ' %15s %15s %15s' % ['Week', 'Total', 'Cumulative']
    puts '-' * 16 * 3

    totals.each do |date, totals|
      puts ' %15s %15s %15s' % [date.to_date, totals.first, totals.last]
    end
  end

  desc "Number of actively developed products by month"
  task :active_products => :environment do
    months = {}
    Activity.where.not(product_id: nil).group(:product_id, "date_trunc('month', created_at)").order("date_trunc('month', created_at)").count.each do |(product_id, date), count|
      months[date] ||= {}
      if count > 10
        product = Product.find(product_id)
        months[date][product.slug] = count
      end
    end

    puts 'Most active products by activity'
    puts
    puts ' %15s %15s %15s' % ['Month', 'Active', 'Top Product']
    puts '-' * 16 * 3

    months.each do |date, products|
      top_product = products.sort_by{|_, count| -count}.find{|p| p[0] != 'meta' }[0]
      puts ' %15s %15s %15s' % [date.to_date, products.count, top_product]
    end
    puts Sparkr.sparkline(months.map{|d, p| p.count})
  end

  task :active_products_csv => :environment do
    months = {}
    Activity.where.not(product_id: nil).group(:product_id, "date_trunc('month', created_at)").order("date_trunc('month', created_at)").count.each do |(product_id, date), count|
      months[date] ||= {}
      if count > 10
        product = Product.find(product_id)
        months[date][product.slug] = count
      end
    end

    require 'csv'
    csv = CSV.generate do |csv|
      csv << ["Month", "Active Products", "Top Product"]
      months.each do |date, products|
        top_product = products.sort_by{|_, count| -count}.find{|p| p[0] != 'meta' }[0]
        csv << [date.to_date, products.count, top_product]
      end
    end

    puts csv
  end

  task :monthly_uniques_csv => :environment do
    tracked_products = Product.joins(:monthly_metrics).group('products.id').to_a

    require 'csv'
    csv = CSV.generate do |csv|
      csv << (["Month", "Total Uniques"] + tracked_products.map(&:name))
      MonthlyMetric.unscoped.order(:date).group_by(&:date).each do |date, metrics|
        row = [date.strftime("%Y-%m"), metrics.map(&:ga_uniques).reduce(:+)]
        row += tracked_products.map{|p| metrics.find{|m| m.product_id == p.id }.try(:ga_uniques) || 0 }
        csv << row
      end
    end
    pp_csv(csv)
    puts csv
  end

  def pp_csv(csv)
    cols = csv.split("\n").first.split(",")
    csv.split("\n").each{|row| $stderr.puts row.split(',').map.with_index{|col, i| col.ljust([cols[i].size, 7].max + 2) }.join }
  end
end
