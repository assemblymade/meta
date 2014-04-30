class UserMetricsSummary
  attr_reader :metric
  attr_reader :at

  def initialize(product, at=Date.today)
    @metric = product.metrics.find_by(name: 'user.active')
    @at = at
  end

  def dates
    [at - 1.week, at]
  end

  def enabled?
    !@metric.nil?
  end

  def user_weeks
    # TODO: (whatupdave) loading user counts is cheating
    @user_counts ||= [
      User.where('created_at <= ?', at - 1.week).count,
      User.where('created_at <= ?', at).count
    ]
  end

  def dau
    @dau ||= [
      metric.uniques.on_day(at - 1.week).count_uniq,
      metric.uniques.on_day(at).count_uniq,
    ]
  end

  def wau
    @wau ||= [
      metric.uniques.in_week(at - 1.week).count_uniq,
      metric.uniques.in_week(at).count_uniq,
    ]
  end

  def mau
    @mau ||= [
      metric.uniques.in_month(at - 1.month).count_uniq,
      metric.uniques.in_month(at).count_uniq,
    ]
  end

  def rows
    [
      { label: 'MAU',   values: mau.map.with_index{|val, i| { raw: val, ratio: val / user_weeks[i].to_f } } },
      { label: 'WAU',   values: wau.map.with_index{|val, i| { raw: val, ratio: val / mau[i].to_f } } },
      { label: 'DAU',   values: dau.map.with_index{|val, i| { raw: val, ratio: val / mau[i].to_f } } },
    ]
  end
end