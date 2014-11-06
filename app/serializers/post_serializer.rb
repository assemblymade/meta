class PostSerializer < ApplicationSerializer
  include MarkdownHelper

  attributes :user, :markdown_body, :url, :summary, :title

  def product
    object.product
  end

  def markdown_body
    product_markdown(product, object.body)
  end

  def url
    product_posts_path(product, object)
  end
end
