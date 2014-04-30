class EasyTrailingAverage
  def self.calculate(periods, first_period, last_period)
    if first_period != 0
      ((first_period / last_period.to_f) ** (1 / (periods.to_f - 1)) - 1)
    end
  end
end