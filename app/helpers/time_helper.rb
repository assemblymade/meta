module TimeHelper

  def days_from_now(time)
    pluralize(days_until_time(time), 'day', 'days')
  end

end
