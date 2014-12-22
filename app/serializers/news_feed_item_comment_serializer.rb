class NewsFeedItemCommentSerializer < ApplicationSerializer
  include MarkdownHelper
  include TippableSerializer

  has_one :user, serializer: UserSerializer
  attributes :body, :created_at, :markdown_body, :url

  attributes :heartable_id, :heartable_type, :hearts_count

  def user
    User.find(object.user_id)
  end

  def markdown_body
    product_markdown(object.product, body)
  end

  def heartable_id
    id
  end

  def heartable_type
    'NewsFeedItemComment'
  end

  def url
    url_for(object.url_params)
  end

  cached

  def cache_key
    ['json', object]
  end
end
