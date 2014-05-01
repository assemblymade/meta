class Event::TypeChange < Event
  store :body, accessors: [ :from, :to ], coder: JSON
  validates :body, presence: true
end
