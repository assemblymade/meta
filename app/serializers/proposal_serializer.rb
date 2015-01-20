class ProposalSerializer < ApplicationSerializer
  attributes :name, :description, :status
  attributes :news_feed_item_id, :url, :comments_count

  has_one :user
  # has_one :news_feed_item

  def url
    product_proposal_path(object.product, object)
  end

  def comments_count
    object.news_feed_item.comments.count
  end

  def news_feed_item_id
    object.news_feed_item.id
  end
end
