class Event::Win < Event
  scope :by, ->(product, user) { joins(:wip).where('wips.user_id = ?', user.id).where('wips.product_id = ?', product.id) }

  def winner
    Award.find_by(event_id: self.id).try(:winner)
  end
end
