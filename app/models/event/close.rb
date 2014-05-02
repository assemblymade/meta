class Event::Close < Event
  validates :body, presence: true, length: { minimum: 2 }

  def self.analytics_name
    'wip.closed'
  end
end