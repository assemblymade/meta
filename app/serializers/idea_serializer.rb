class IdeaSerializer < ApplicationSerializer
  include MarkdownHelper
  include TruncateHtmlHelper

  attributes :body, :comments_count, :created_at, :greenlit_at, :heart_distance_from_percentile
  attributes :id, :name, :news_feed_item, :percentile, :score, :short_body
  attributes :temperature, :url

  has_one :user

  def body
    markdown(object.body)
  end

  def comments_count
    object.comments.count
  end

  def news_feed_item_id
    object.news_feed_item.id
  end

  def short_body
    truncate_html(markdown(object.body), length: 150)
  end

  def url
    idea_url(object)
  end
end
