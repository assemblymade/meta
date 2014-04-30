class Event::TagChange < Event
  store :body, accessors: [ :from, :to ], coder: JSON

  validates :body, presence: true

  def from
    super.split(',').map(&:strip).sort
  end

  def to
    super.split(',').map(&:strip).sort
  end
end