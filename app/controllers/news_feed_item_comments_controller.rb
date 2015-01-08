class NewsFeedItemCommentsController < ProductController
  include MarkdownHelper

  before_action :find_product!
  before_action :set_news_feed_item!
  before_action :authenticate_user!, only: [:create]

  respond_to :json

  def create
    @comment = @news_feed_item.comments.create(
      user: current_user,
      body: params[:body]
    )

    if @comment.valid?
      @comment.publish_activity!
      @comment.notify_subscribers!
      @comment.track_acknowledgements!
    end

    respond_with @comment, location: product_updates_url(@product)
  end

  def index
    comments = ActiveModel::ArraySerializer.new(
      @news_feed_item.comments.order(created_at: :asc),
      each_serializer: NewsFeedItemCommentSerializer
    )

    events = ActiveModel::ArraySerializer.new(
      @news_feed_item.events.order(created_at: :asc),
      each_serializer: EventSerializer,
      scope: current_user
    )

    user_hearts = if signed_in?
      Heart.where(user: current_user, heartable_id: comments.as_json.map{|h| h['heartable_id']})
    else
      []
    end

    discussion = {
      analytics: DiscussionAnalyticsSerializer.new(@news_feed_item),
      comments: comments,
      events: events,
      user_hearts: user_hearts
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
