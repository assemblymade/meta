class Event::Win < Event
  belongs_to :event

  validates :event, presence: true

  scope :by, ->(product, user) { joins(:wip).where('wips.user_id = ?', user.id).where('wips.product_id = ?', product.id) }

  def winner
    event.try(:user)
  end
end
