class NewsFeedItem < ActiveRecord::Base
  belongs_to :target, polymorphic: true
  belongs_to :product
  has_many :news_feed_item_comments

  after_commit :set_number, on: :create

  def self.create_with_target(target)
    create!(
      product: target.product,
      source_id: target.user.id,
      target: target
    )
  end
end
