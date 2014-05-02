class Event::Rejection < Event
  validates :body, presence: true, length: { minimum: 2 }
  
  def analytics_name
    'wip.rejected'
  end
  
end