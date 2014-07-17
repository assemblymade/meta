class Event::FullCommentSerializer < ApplicationSerializer
  include MarkdownHelper
  include TippableSerializer

  has_one :user, key: :actor

  attributes :anchor, :body_html, :number, :timestamp

  def anchor
    "comment-#{object.number}"
  end

  def body_html
    Rails.cache.fetch([object, 'body']) do
      product_markdown(object.product, object.body)
    end
  end

  def timestamp
    if object.created_at
      object.created_at.iso8601
    end
  end

  def type
    object.class.name
  end
end
