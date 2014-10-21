class NewsFeedItemsController < ProductController
  before_action :find_product!

  def index
    @news_feed_items = @product.news_feed_items.order(updated_at: :desc)
    respond_with @news_feed_items
  end
end
