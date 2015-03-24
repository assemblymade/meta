class IdeaSerializer < ApplicationSerializer
  include MarkdownHelper
  include TruncateHtmlHelper

  attributes :body, :categories, :comments_count, :created_at,
    :flagged_at, :founder_preference, :greenlit_at, :hearts_count,
    :heart_distance_from_percentile, :id, :name, :news_feed_item, :path,
    :percentile, :product, :rank, :raw_body, :score,
    :short_body, :slug, :tilting_threshold, :topics, :url, :mark_names, :tentative_name, :sanitized_body,
    :total_visitors

  has_one :product
  has_one :user

  cached

  def cache_key
    ['v2', object, object.news_feed_item]
  end

  def body
    markdown(object.body)
  end

  def comments_count
    object.news_feed_item.comments_count
  end

  def tentative_name
    object.tentative_name
  end

  def path
    idea_path(object)
  end

  def raw_body
    object.body
  end

  def short_body
    truncate_html(markdown(object.body), length: 120)
  end

  def sanitized_body
    Search::Sanitizer.new.sanitize(object.body)
  end

  def url
    idea_url(object)
  end
end
