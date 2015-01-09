class IdeaSerializer < ApplicationSerializer
  include MarkdownHelper
  include TruncateHtmlHelper

  attributes :body, :comments_count, :created_at, :greenlit_at, :id, :name
  attributes :score, :short_body, :url

  has_one :user

  def comments_count
    object.comments.count
  end

  def short_body
    truncate_html(markdown(object.body), length: 150)
  end

  def url
    idea_path(object)
  end
end
