class ProposalSerializer < ApplicationSerializer
  include MarkdownHelper
  include TruncateHtmlHelper
  attributes :name, :description, :status
  attributes :news_feed_item_id, :url, :comments_count, :state, :status, :contracts, :time_left_text
  attributes :short_body
  has_one :user

  def url
    product_proposal_path(object.product, object)
  end

  def status
    object.status
  end

  def comments_count
    object.news_feed_item.comments.count
  end

  def news_feed_item_id
    object.news_feed_item.id
  end

  def short_body
    #object.description
    truncate_html(markdown(object.description), length: 250)
  end

end
