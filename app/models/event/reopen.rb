class Event::Reopen < Event
  validates :body, presence: true, length: { minimum: 2 }
end