class NewsFeedItemsController < ProductController
  before_action :find_product!

  def index
    @news_feed_items = ActiveModel::ArraySerializer.new(
      @product.news_feed_items.order(updated_at: :desc)
    ).as_json
  end
end
