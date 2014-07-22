# This one has been cut down to be used in chat. It has no reference to the author of the comment as that is stored
# in the activity object
class Event::CommentSerializer < ApplicationSerializer
  include ReadraptorTrackable
  include MarkdownHelper

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
end
