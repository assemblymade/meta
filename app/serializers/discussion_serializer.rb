class DiscussionSerializer < ApplicationSerializer
  include ReadraptorTrackable
  include MarkdownHelper

  attributes :number, :title, :url, :description_html

  def url
    product_discussion_path(product, number)
  end

  def product
    @product ||= object.product
  end

  def description_html
    product_markdown(product, object.comments.first.try(:body))
  end
end
