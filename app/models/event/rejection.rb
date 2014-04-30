class Event::Rejection < Event
  validates :body, presence: true, length: { minimum: 2 }
end