# (whatupdave) yes I know this file is insane...

namespace :stats do
  task :all  => :environment do
    include ActionView::Helpers::NumberHelper

    def collect_created_at_before_metric(end_at, weeks, title, scope, table)
      months = [
        scope.where("#{table}.created_at <= date(?)", end_at - 1.month).count,
        scope.where("#{table}.created_at <= date(?)", end_at).count,
      ]
      percent_change = (months[1] - months[0]) / months[0].to_f

      monday = end_at.beginning_of_week
      previous_monday = monday - 1.week
      first_week = monday - (weeks - 1).weeks

      week_counts = weeks.times.map do |week|
        scope.where("#{table}.created_at <= date(?)",
          monday - (weeks - week - 2).weeks,
        ).count
      end

      between = "#{table}.created_at < ?"
      sum_first_week = scope.where(between, first_week + 1.week).count
      sum_last_week = scope.where(between, previous_monday + 1.week).count
      sum_this_week = scope.where(between, monday + 1.week).count

      tsw = ((sum_this_week / sum_first_week.to_f) ** (1 / (weeks.to_f - 1)) - 1)

      [title,
        months[0],
        months[1],
        number_to_percentage(percent_change * 100, precision: 0),
        number_to_percentage(tsw * 100, precision: 0),
      ]
    end

    def collect_created_at_metric(end_at, weeks, title, scope, table)
      months = [
        scope.where("#{table}.created_at > date(?) and #{table}.created_at <= date(?)", end_at - 2.months, end_at - 1.month).count,
        scope.where("#{table}.created_at > date(?) and #{table}.created_at <= date(?)", end_at - 1.month, end_at).count,
      ]
      percent_change = (months[1] - months[0]) / months[0].to_f

      monday = end_at.beginning_of_week
      previous_monday = monday - 1.week
      first_week = monday - (weeks - 1).weeks

      week_counts = weeks.times.map do |week|
        scope.where("#{table}.created_at > date(?) and #{table}.created_at <= date(?)",
          monday - (weeks - week - 1).weeks,
          monday - (weeks - week - 2).weeks,
        ).count
      end

      between = "#{table}.created_at >= ? and #{table}.created_at < ?"
      sum_first_week = scope.where(between, first_week, first_week + 1.week).count
      sum_last_week = scope.where(between, previous_monday, previous_monday + 1.week).count
      sum_this_week = scope.where(between, monday, monday + 1.week).count

      tsw = ((sum_this_week / sum_first_week.to_f) ** (1 / (weeks.to_f - 1)) - 1)

      [title,
        months[0],
        months[1],
        number_to_percentage(percent_change * 100, precision: 0),
        number_to_percentage(tsw * 100, precision: 0),
      ]
    end

    def collect_uniq_metric(end_at, weeks, title, queries)
      months = [
        queries.inject(0) do |sum, q|
          scope = q[:scope]
          table = q[:table]
          sum + scope.where("#{table}.created_at > date(?) and #{table}.created_at <= date(?)", end_at - 2.months, end_at - 1.month).group("#{table}.user_id").count.size
        end,
        queries.inject(0) do |sum, q|
          scope = q[:scope]
          table = q[:table]
          sum + scope.where("#{table}.created_at > date(?) and #{table}.created_at <= date(?)", end_at - 1.month, end_at).group("#{table}.user_id").count.size
        end
      ]
      percent_change = (months[1] - months[0]) / months[0].to_f

      monday = end_at.beginning_of_week
      previous_monday = monday - 1.week
      first_week = monday - (weeks - 1).weeks

      week_counts = weeks.times.map do |week|
        queries.inject(0) do |sum, q|
          scope = q[:scope]
          table = q[:table]
          sum + scope.where("#{table}.created_at > date(?) and #{table}.created_at <= date(?)",
            monday - (weeks - week - 1).weeks,
            monday - (weeks - week - 2).weeks,
          ).group("#{table}.user_id").count.size
        end
      end

      sum_first_week = queries.inject(0) do |sum, q|
        scope = q[:scope]
        table = q[:table]
        between = "#{table}.created_at >= ? and #{table}.created_at < ?"
        sum + scope.where(between, first_week, first_week + 1.week).group("#{table}.user_id").count.size
      end

      sum_last_week = queries.inject(0) do |sum, q|
        scope = q[:scope]
        table = q[:table]
        between = "#{table}.created_at >= ? and #{table}.created_at < ?"
        sum + scope.where(between, previous_monday, previous_monday + 1.week).group("#{table}.user_id").count.size
      end

      sum_this_week = queries.inject(0) do |sum, q|
        scope = q[:scope]
        table = q[:table]
        between = "#{table}.created_at >= ? and #{table}.created_at < ?"
        sum + scope.where(between, monday, monday + 1.week).group("#{table}.user_id").count.size
      end

      tsw = ((sum_this_week / sum_first_week.to_f) ** (1 / (weeks.to_f - 1)) - 1)

      [title,
        months[0],
        months[1],
        number_to_percentage(percent_change * 100, precision: 0),
        number_to_percentage(tsw * 100, precision: 0),
      ]
    end

    end_at = Date.parse('31-Jan-2014')
    weeks = 6

    rows = []

    # Total Users
    rows << collect_created_at_before_metric(end_at, weeks, 'Total Users', User, 'users')

    # Active builders
    rows << collect_uniq_metric(end_at, weeks, 'Active Builders', [
      {
        scope: Product.find_by(slug: 'helpful').events.where('events.user_id not in (?)', User.staff.ids),
        table: 'events'
      },
      {
        scope: Product.where('products.user_id not in (?)', User.staff.ids),
        table: 'products'
      },
    ])

    # Product Enhancements
    scope = Product.find_by(slug: 'helpful').events.where('events.user_id not in (?)', User.staff.ids)
    rows << collect_created_at_metric(end_at, weeks, 'Product Enhancements', scope, 'events')

    puts Terminal::Table.new :headings => ['Metric', 'Dec 13', 'Jan 14', '% change', 'TSW Average'], :rows => rows
  end

  task :working => :environment do
    include ActionView::Helpers::DateHelper
    asm = Product.find_by!(slug:'asm')

    asm.core_team.order(:username).distinct.each do |u|
      if worker = u.wip_workers.joins(:wip).where('wips.product_id' => asm.id).order(:created_at).last
        puts "#{u.username} is working on [#{worker.wip.product.slug}##{worker.wip.number}] #{worker.wip.title} (#{time_ago_in_words(worker.created_at)} ago)"
      else
        puts "#{u.username} is chillin"
      end
    end
  end
end
