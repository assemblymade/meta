class Time
  def utc_start_of_month
    self.to_date.beginning_of_month.to_time.strip_tz
  end

  def utc_end_of_month
    (self.to_date.end_of_month + 1.day).to_time.strip_tz - 1.second
  end

  def strip_tz
    Time.parse(self.strftime("%Y-%m-%dT%T") + '-00:00')
  end
end
