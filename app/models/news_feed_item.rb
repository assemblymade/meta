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
    unless target.user.username == 'kernel'
      create!(
        product: target.product,
        source: target.user,
        target: target
      )
    end
  end
end
