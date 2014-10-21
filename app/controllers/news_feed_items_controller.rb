class NewsFeedItemsController < ProductController
  before_action :find_product!

  def index
    @news_feed_items = ActiveModel::ArraySerializer.new(
      @product.news_feed_items.order(updated_at: :desc),
      each_serializer: NewsFeedItemSerializer
    ).as_json
  end

  def all
    @news_feed_items = ActiveModel::ArraySerializer.new(
      NewsFeedItem.take(20).order(updated_at: :desc),
      each_serializer: NewsFeedItemSerializer
    ).as_json
  end
end
