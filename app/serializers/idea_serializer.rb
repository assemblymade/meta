class IdeaSerializer < ApplicationSerializer
  include MarkdownHelper
  include TruncateHtmlHelper

  attributes :body, :comments_count, :created_at, :greenlit_at, :id, :name
  attributes :score, :short_body, :url, :user

  def comments_count
    object.comments.count
  end

  def short_body
    truncate_html(object.body, length: 200)
  end

  def url
    idea_path(object)
  end

  def user
    UserSerializer.new(object.user)
  end
end
