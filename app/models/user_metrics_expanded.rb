class UserMetricsExpanded
  attr_reader :product
  attr_reader :at

  def initialize(product, at=Date.today)
    @product = product
    @at = at
  end

  def metrics
    @metrics ||= product.metrics.each_with_object({}) {|m, h| h[m.name] = m }
  end

  def month_ends
    [
      at.end_of_month - 3.months,
      at.end_of_month - 2.months,
      at.end_of_month - 1.months,
    ]
  end

  def user_months
    # TODO: (whatupdave) loading user counts is cheating
    @user_months ||= month_ends.map do |end_at|
      User.where('date(created_at) < ?', end_at).count
    end
  end

  def user_tsw_average
    EasyTrailingAverage.calculate(
      6,
      User.where('date(created_at) < ?', month_ends.last.beginning_of_week - 7.weeks).count,
      User.where('date(created_at) < ?', month_ends.last.beginning_of_week - 1.week).count
    )
  end

  def mau
    @mau ||= month_ends.map do |end_at|
      metrics['user.active'].uniques.in_month(end_at).count_uniq
    end
  end

  def mau_tsw
    EasyTrailingAverage.calculate(
      6,
      metrics['user.active'].uniques.in_week(month_ends.last.beginning_of_week - 7.weeks).count_uniq,
      metrics['user.active'].uniques.in_week(month_ends.last.beginning_of_week - 1.week).count_uniq
    )
  end

  def mab
    @mab ||= month_ends.map do |end_at|
      metrics['user.builder.active'].uniques.in_month(end_at).count_uniq
    end
  end

  def mab_tsw
    EasyTrailingAverage.calculate(
      6,
      metrics['user.builder.active'].uniques.in_week(month_ends.last.beginning_of_week - 7.weeks).count_uniq,
      metrics['user.builder.active'].uniques.in_week(month_ends.last.beginning_of_week - 1.week).count_uniq
    )
  end

  def product_enhancements
    @pes ||= month_ends.map do |end_at|
      metrics['product.enhancement'].measurements.in_month(end_at).sum(:value)
    end
  end

  def product_enhancements_tsw
    EasyTrailingAverage.calculate(
      6,
      metrics['product.enhancement'].measurements.in_week(month_ends.last.beginning_of_week - 7.weeks).sum(:value),
      metrics['product.enhancement'].measurements.in_week(month_ends.last.beginning_of_week - 1.week).sum(:value)
    )
  end

  def app_ideas
    # TODO: (whatupdave) loading product counts is cheating
    @app_ideas ||= month_ends.map do |end_at|
      Product.created_in_month(end_at).count
    end
  end

  def app_ideas_tsw
    EasyTrailingAverage.calculate(
      6,
      Product.created_in_week(month_ends.last.beginning_of_week - 7.weeks).count,
      Product.created_in_week(month_ends.last.beginning_of_week - 1.week).count,
    )
  end

  def conversion_rates
    @conversion_rates ||= begin
      mixpanel = Metrics::Mixpanel.new
      month_ends.map do |end_at|
        start_at = end_at.beginning_of_month

        mixpanel.funnel_conversion ENV['MIXPANEL_CONVERSION_FUNNEL_ID'], start_at, end_at
      end
    end
  end

  def rows
    [
      row('Conversion Rate', conversion_rates, nil, key: :percentage),
      row('Total Users', user_months, user_tsw_average),
      row('MAU', mau, mau_tsw, ratio: user_months),
      row('Monthly Active Builders', mab, mab_tsw, ratio: user_months),
      row('Product Enhancements', product_enhancements, product_enhancements_tsw),
      row('App ideas', app_ideas, app_ideas_tsw),
    ]
  end

  def row(label, values, tsw, options={})
    row = {
      label: label,
      change: 1 - (values[-2] / values[-1].to_f),
      tsw: tsw
    }

    if options[:ratio]
      row.merge!(
        values: values.map.with_index{|val, i| { raw: val, ratio: val / options[:ratio][i].to_f } },
      )
    else
      row.merge!(
        values: values.map.with_index{|val, i| { (options[:key] || :raw) => val } },
      )
    end

    row
  end
end