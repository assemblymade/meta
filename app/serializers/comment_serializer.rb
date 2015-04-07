class CommentSerializer < ApplicationSerializer
  include MarkdownHelper

  has_one :user, serializer: AvatarSerializer
  attributes :body, :created_at, :markdown_body, :news_feed_item_id, :hearts_count, :tips_total

  def markdown_body
    markdown(body)
  end
end
