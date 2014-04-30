module DateRangeExtensions
  def on_day(date)
    where('date(measurements.created_at) = ?', date)
  end
end