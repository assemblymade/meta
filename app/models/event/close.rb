class Event::Close < Event
  def self.analytics_name
    'wip.closed'
  end

  def sanitized_body
    Search::Sanitizer.new.sanitize(body)
  end
end
