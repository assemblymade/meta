class TaskDecorator < WipDecorator
  decorates_association :watchers

  def deliverable_icon_class
    "#{task.deliverable}-icon"
  end

  def voted?(user)
    user.voted_for?(self)
  end

  def votable?
    true
  end

  def coins
    product.decorate.current_exchange_rate * score
  end

  def coins_add
    score_multiplier * product.decorate.current_exchange_rate
  end
end
