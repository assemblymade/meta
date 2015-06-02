class CommentsController < ApplicationController
  respond_to :json

  before_action :authenticate_user!, only: [:create, :update]
  before_action :set_discussion

  def index
    comments = ActiveModel::ArraySerializer.new(
      @discussion.comments.order(created_at: :asc).includes(:user),
      each_serializer: CommentSerializer,
      scope: current_user
    )

    events = ActiveModel::ArraySerializer.new(
      @discussion.events.order(created_at: :asc).includes(:user, :wip),
      each_serializer: EventSerializer,
      scope: current_user
    )

    user_hearts = []
    user_tips = []
    if signed_in?
      user_hearts = Heart.where(user: current_user, heartable_id: comments.as_json.map{|h| h['heartable_id']})
      user_tips = Hash[Tip.where(from_id: current_user.id, via: @discussion.comments).pluck(:via_id, :cents)]
    end

    respond_with({
      analytics: DiscussionAnalyticsSerializer.new(@discussion),
      comments: comments,
      events: events,
      user_hearts: user_hearts,
      user_tips: user_tips
    })
  end

  def create
    @comment = @discussion.comments.create(
      user: current_user,
      body: params[:body]
    )

    if @comment.valid?
      @comment.publish_activity!
      @comment.notify_subscribers!
      @comment.track_acknowledgements!
      pusher(@discussion.id, "COMMENT_ADDED", NewsFeedItemCommentSerializer.new(@comment))
      push_mentions(@comment)
    end

    respond_with({
      comment: NewsFeedItemCommentSerializer.new(@comment),
      subscribed: Watching.watched?(current_user, @comment.news_feed_item)
    }, location: discussion_comments_path(@discussion))
  end

  def update
    @comment = @discussion.comments.find(params[:id])
    authorize! :update, @comment

    @comment.update(comment_params)

    render json: @comment
  end

  # private

  def set_discussion
    @discussion = NewsFeedItem.find(params[:discussion_id])
  end

  def comment_params
    params.require(:comment).permit(:body)
  end

  def push_mentions(comment)
    # push @mentions to mentionee
    (comment.mentioned_users - [comment.user]).each do |user|
      PushMention.push(
        user.id,
        params[:socket_id],
        "@#{comment.user.username} mentioned you",
        comment,
        url_for(comment.url_params)
      )
    end
  end
end
