class NewsFeedItemsController < ProductController
  before_action :find_product!
  before_action :find_news_feed_item!, except: :index

  def show
    begin
      redirect_to @news_feed_item.target
    rescue => e
      redirect_to url_for([@product, @news_feed_item.target])
    end
  end

  def index
    respond_to do |format|
      format.html do
        @news_feed_items = ActiveModel::ArraySerializer.new(
          @product.news_feed_items.unarchived_items.order(updated_at: :desc)
        ).as_json
      end

      format.json do @product.news_feed_items
        @news_feed_items = @product.news_feed_items.unarchived_items.order(last_commented_at: :desc)
        render json: @news_feed_items.page(params[:page]).per(10),
          serializer: PaginationSerializer,
          each_serializer: NewsFeedItemSerializer,
          root: :news_feed_items
      end
    end
  end

  def update
    return head(:forbidden) unless can? :update, @news_feed_item

    @news_feed_item.update(news_feed_item_params)
    render nothing: true, status: 200
  end

  def popularize
    @news_feed_item.update_columns(popular_at: Time.now)
    render nothing: true, status: 200
  end

  def depopularize
    @news_feed_item.update_columns(popular_at: nil)
    render nothing: true, status: 200
  end

  def subscribe
    Watching.watch!(current_user, @news_feed_item)
    render nothing: true, status: 200
  end

  def unsubscribe
    Watching.unwatch!(current_user, @news_feed_item)
    render nothing: true, status: 200
  end

  private

  def find_news_feed_item!
    @news_feed_item = NewsFeedItem.find(params[:id] || params[:update_id])
  end

  def news_feed_item_params
    params.require(:news_feed_item).permit(:archived_at)
  end
end
