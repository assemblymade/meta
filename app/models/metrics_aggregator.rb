class MetricsAggregator
  attr_reader :product

  def initialize(product)
    @product = product
  end

  def by_week(weeks, at=Date.today)
    Metric.where(product_id: product.id).map do |metric|
      if metric.measurements.exists?
        counts_by_week(metric, weeks, at)
      else
        uniques_by_week(metric, weeks, at)
      end
    end
  end

  def counts_by_week(metric, weeks, at)
    scope = metric.measurements
    sunday = at.beginning_of_week - 1.day
    previous_sunday = sunday - 1.week
    first_week = sunday - weeks.weeks

    between = 'measurements.created_at >= ? and measurements.created_at < ?'
    first_week = scope.where(between, first_week, first_week + 1.week)
    last_week  = scope.where(between, previous_sunday, previous_sunday + 1.week)
    this_week  = scope.where(between, sunday, sunday + 1.week)

    sum_first_week = first_week.sum(:value)
    sum_last_week = last_week.sum(:value)
    sum_this_week = this_week.sum(:value)

    {
      metric: metric,
      weeks: weeks,
      sum_first_week: sum_first_week,
      sum_last_week:  sum_last_week,
      sum_this_week:  sum_this_week,
      last_week: last_week.
        group('date(measurements.created_at)').
        order('date(measurements.created_at)').sum(:value),
      this_week: this_week.
        group('date(measurements.created_at)').
        order('date(measurements.created_at)').sum(:value),
    }
  end

  def uniques_by_week(metric, weeks, at)
    scope = metric.uniques
    sunday = at.beginning_of_week - 1.day
    previous_sunday = sunday - 1.week
    first_week = sunday - weeks.weeks

    between = 'uniques.created_at >= ? and uniques.created_at < ?'
    first_week = scope.where(between, first_week, first_week + 1.week)
    last_week  = scope.where(between, previous_sunday, previous_sunday + 1.week)
    this_week  = scope.where(between, sunday, sunday + 1.week)

    sum_first_week = first_week.group(:distinct_id).count.count
    sum_last_week  = last_week.group(:distinct_id).count.count
    sum_this_week  = this_week.group(:distinct_id).count.count

    last_week_by_day = count_distinct_by_day(last_week, 'uniques', :distinct_id)
    this_week_by_day = count_distinct_by_day(this_week, 'uniques', :distinct_id)

    {
      metric: metric,
      weeks: weeks,
      sum_first_week: sum_first_week,
      sum_last_week:  sum_last_week,
      sum_this_week:  sum_this_week,
      last_week: last_week_by_day,
      this_week: this_week_by_day,
    }
  end

  def count_distinct_by_day(scope, table, distinct_key)
    scope.
      group("date(#{table}.created_at)").
      group(distinct_key).
      order("date(#{table}.created_at)").
      count.inject({}) do |h, ((date, distinct_id), count)|
        h[date] ||= 0
        h[date] += 1
        h
      end
  end

  def self.current_user_count
    User.where(is_staff: true).where('last_request_at > ?', 15.minutes.ago).count
  end

  def self.love_throughput
    Heart.joins(:user).where("users.is_staff=false").where('hearts.created_at > ?', 1.days.ago).count
  end

  def self.products_since_week
    Product.where('created_at > ?', 7.days.ago).select{|a| TransactionLogEntry.product_partners(a.id).to_a.count > 1}.count
  end

  def self.assemble_overview_metrics
    metrics = {}
    metrics['current_users'] = self.current_user_count
    metrics['love_throughput'] = self.love_throughput
    metrics['weekly_new_products_with_partners'] = products_since_week
    metrics
  end

end
