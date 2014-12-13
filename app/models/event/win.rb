class Event::Win < Event
  scope :by, ->(product, user) { joins(:wip).where('wips.user_id = ?', user.id).where('wips.product_id = ?', product.id) }

  def winner
    # TODO: (whatupdave) migrate data to avoid this if check
    if event_id.nil?
      Award.find_by(event_id: self.id).try(:winner)
    else
      event.user
    end
  end
end
