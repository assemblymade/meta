class NewsFeedItem < ActiveRecord::Base
  include Kaminari::ActiveRecordModelExtension

  belongs_to :target, polymorphic: true
  belongs_to :product
  belongs_to :source, class: User
  has_many :news_feed_item_comments

  has_many :hearts, as: :heartable

  scope :public_items, -> { joins(:product).where('products.state not in (?)', ['stealth', 'reviewing']) }

  def self.create_with_target(target)
    # Prevent @kernel from appearing in the News Feed
    # (gross)
    return if target.user.username == 'kernel'
    create!(
      product: target.try(:product),
      source: target.user,
      target: target
    )
  end

  def author_id
    self.source_id # currently this is always a user, might be polymorphic in the future
  end

  def comments
    self.news_feed_item_comments
  end
end
