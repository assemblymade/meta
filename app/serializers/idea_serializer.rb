class IdeaSerializer < ApplicationSerializer
  include MarkdownHelper
  include TruncateHtmlHelper

  attributes :body, :comments_count, :created_at, :greenlit_at
  attributes :hearts_count, :heart_distance_from_percentile
  attributes :id, :name, :news_feed_item, :path, :percentile, :score
  attributes :short_body, :tilting_threshold, :url

  has_one :user

  def body
    markdown(object.body)
  end

  def comments_count
    object.comments.count
  end

  def path
    idea_path(object)
  end

  def short_body
    truncate_html(markdown(object.body), length: 150)
  end

  def url
    idea_url(object)
  end
end
