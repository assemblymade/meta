class IdeaSerializer < ApplicationSerializer
  include MarkdownHelper
  include TruncateHtmlHelper

  attributes :body, :categories, :comments_count, :created_at,
    :flagged_at, :founder_preference, :greenlit_at, :hearts_count,
    :heart_distance_from_percentile, :id, :name, :news_feed_item, :path,
    :percentile, :product, :rank, :rank_total, :raw_body, :score,
    :short_body, :slug, :tilting_threshold, :topics, :url, :mark_names, :tentative_name

  has_one :product
  has_one :user

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

  def url
    idea_url(object)
  end

  def rank_total
    Idea.where(greenlit_at: nil).count
  end
end
