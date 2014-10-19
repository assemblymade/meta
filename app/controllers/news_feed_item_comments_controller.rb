class NewsFeedItemCommentsController < ProductController
  before_action :find_product!
  before_action :set_news_feed_item!
  before_action :authenticate_user!, only: [:create]

  respond_to :json

  def create
    item = @news_feed_item.news_feed_item_comments.create(
      user_id: current_user.id,
      body: params[:body]
    )

    respond_with item, location: product_activities_url(@product)
  end

  def set_news_feed_item!
    @news_feed_item = NewsFeedItem.find_by(
      product: @product,
      number: params[:activity_id]
    )
  end
end
