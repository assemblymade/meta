class NewsFeedItemCommentsController < ProductController
  before_action :find_product!
  before_action :set_news_feed_item!
  before_action :authenticate_user!, only: [:create]

  respond_to :json

  def create
    @item = @news_feed_item.news_feed_item_comments.create(
      user_id: current_user.id,
      body: params[:body]
    )

    @news_feed_item.update(updated_at: Time.now)

    forward_comment

    respond_with @item, location: product_activities_url(@product)
  end

  def forward_comment
    if target = @news_feed_item.target
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
    end
  end

  def set_news_feed_item!
    @news_feed_item = NewsFeedItem.find(params[:activity_id])
  end
end
