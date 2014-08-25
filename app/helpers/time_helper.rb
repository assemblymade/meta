module TimeHelper
  def timestamp(datetime)
    content_tag(:time, nil, class: 'timestamp', datetime: datetime.iso8601).html_safe
  end
end