class IdeaCommentsController < ProductController
  include MarkdownHelper

  before_action :find_idea!
  before_action :authenticate_user!, only: [:create]

  respond_to :json

  def create
    comment = @idea.news_feed_item.comments
    .create!(
      user: current_user,
      body: params[:body]
    )
    respond_with comment, location: ideas_url(@idea), serializer: IdeaCommentSerializer
  end

  def index
    comments = ActiveModel::ArraySerializer.new(
      @idea.news_feed_item.comments.order(created_at: :asc),
      each_serializer: IdeaCommentSerializer
    )

    events = ActiveModel::ArraySerializer.new(
      @idea.news_feed_item.events.order(created_at: :asc),
      each_serializer: EventSerializer,
      scope: current_user
    )

    user_hearts = if signed_in?
      Heart.where(user: current_user, heartable_id: comments.as_json.map{|h| h['heartable_id']})
    else
      []
    end

    discussion =

    respond_with({
      comments: comments,
      events: events,
      user_hearts: user_hearts
    })
  end

  def update
    if comment = NewsFeedItemComment.find(params[:id])
      comment.update(comment_params)

      respond_with comment do |format|
        format.json { render json: IdeaCommentSerializer.new(comment) }
      end
    end
  end

  private

  def comment_params
    params.require(:comment).permit(:body)
  end

  def find_idea!
    @idea = Idea.find(params[:idea_id])
  end
end
