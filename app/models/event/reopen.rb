class Event::Reopen < Event
  validates :body, presence: true, length: { minimum: 2 }
  
  def analytics_name
    'wip.reopened'
  end
end