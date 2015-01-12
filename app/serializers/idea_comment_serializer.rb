class IdeaCommentSerializer < ApplicationSerializer
  include MarkdownHelper

  has_one :user, serializer: UserSerializer
  attributes :body, :created_at, :markdown_body, :news_feed_item_id

  def user
    User.find(object.user_id)
  end

  def markdown_body
    idea_markdown(body)
  end
end
