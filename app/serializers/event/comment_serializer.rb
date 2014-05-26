class Event::CommentSerializer < EventSerializer
  include CoinHelper

  def anchor
    "comment-#{object.number}"
  end

  has_many :tips
  attributes :total_tips, :formatted_total_tips, :any_tips, :current_user_can_tip

  def formatted_total_tips
    object.total_tips / 100
  end

  def any_tips
    object.tips.any?
  end

  def current_user_can_tip
    scope &&
    TransactionLogEntry.where(user_id: scope.id, product_id: object.product.id).with_cents.count > 0
  end

  attributes :tip_path

  def tip_path
    if object.id # This check is crazy, it's only if fake events get pushed into the stream (like maeby's first comment)
      product_event_tips_path(object.product, object.id)
    end
  end

end
