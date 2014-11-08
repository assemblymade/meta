class NewsFeedItemCommentSerializer < ApplicationSerializer
  include MarkdownHelper

  has_one :user, serializer: UserSerializer
  attributes :body, :created_at, :markdown_body

  def user
    User.find(object.user_id)
  end

  def markdown_body
    product_markdown(object.product, body.try(:truncate, 200, separator: /\s/))
  end

end
