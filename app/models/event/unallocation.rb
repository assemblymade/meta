class Event::Unallocation < Event
  validates :body, presence: true, length: { minimum: 2 }

  def analytics_name
    'wip.unallocated'
  end

end