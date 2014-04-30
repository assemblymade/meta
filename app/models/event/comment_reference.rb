class Event::CommentReference < Event
  belongs_to :event
  validates :event, presence: true
end