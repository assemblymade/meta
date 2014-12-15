class NewsFeedItemPostSerializer < ApplicationSerializer
  include MarkdownHelper
  attributes :url, :title, :description

  def url
    url_for(object.url_params)
  end

  def description
    product_markdown(object.product, object.description)
  end
end
