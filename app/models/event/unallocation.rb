class Event::Unallocation < Event
  validates :body, presence: true, length: { minimum: 2 }
end