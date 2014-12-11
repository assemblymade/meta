class NewsFeedItemCommentsController < ProductController
  include MarkdownHelper

  before_action :find_product!
  before_action :set_news_feed_item!
  before_action :authenticate_user!, only: [:create]

  respond_to :json

  def create
    @item = @news_feed_item.comments.create!(
      user: current_user,
      body: params[:body]
    )

    publish_comment

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

  def publish_comment
    if target = @news_feed_item.target
      # we're currently duplicating comments to wip comments. This will be fixed
      # we can remove this if block then
      if target.is_a? Wip
        event = Event.create_from_comment(
          target,
          Event::Comment,
          @item.body,
          current_user
        )

        Activities::Comment.publish!(
          actor: event.user,
          subject: event,
          target: target
        )
      else
        Activities::Comment.publish!(
          actor: @item.user,
          subject: @item,
          target: target
        )
      end
    end
  end

  def set_news_feed_item!
    @news_feed_item = NewsFeedItem.find(params[:update_id])
  end
end
