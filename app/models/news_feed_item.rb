class NewsFeedItem < ActiveRecord::Base
  include Kaminari::ActiveRecordModelExtension

  belongs_to :target, polymorphic: true
  belongs_to :product
  has_many :news_feed_item_comments

  def self.create_with_target(target)
    # Prevent @kernel from appearing in the News Feed
    # (gross)
    unless target.user.username == 'kernel'
      create!(
        product: target.product,
        source_id: target.user.id,
        target: target
      )
    end
  end
end
