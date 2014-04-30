class Event::Win < Event
  belongs_to :event

  validates :event, presence: true

  def winner
    event.user
  end
end
