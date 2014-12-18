class NewsFeedItemCommentsController < ProductController
  include MarkdownHelper

  before_action :find_product!
  before_action :set_news_feed_item!
  before_action :authenticate_user!, only: [:create]

  respond_to :json

  def create
    @item = @news_feed_item.comments.create(
      user: current_user,
      body: params[:body]
    )

    if @item.valid?
      @item.publish_activity!
      @item.notify_subscribers!
    end

    respond_with @item, location: product_updates_url(@product)
  end

  def index
    comments = ActiveModel::ArraySerializer.new(
      @news_feed_item.comments.order(created_at: :asc),
      each_serializer: NewsFeedItemCommentSerializer
    )

    events = ActiveModel::ArraySerializer.new(
      @news_feed_item.events.order(created_at: :asc),
      scope: current_user
    )

    discussion = {
      comments: comments,
      events: events
    }

    respond_with discussion, location: product_url(@product)
  end

  def update
    if comment = NewsFeedItemComment.find(params[:id])
      comment.update(comment_params)

      respond_with comment do |format|
        format.json { render json: comment }
      end
    end
  end

  def set_news_feed_item!
    @news_feed_item = NewsFeedItem.find(params[:update_id])
  end

  private

  def comment_params
    params.require(:comment).permit(:body)
  end
end
