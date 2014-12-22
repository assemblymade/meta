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
    respond_with ActiveModel::ArraySerializer.new(
      @idea.news_feed_item.comments.order(created_at: :desc),
      each_serializer: IdeaCommentSerializer
    ).as_json
  end

  private

    def find_idea!
      @idea = Idea.friendly.find(params[:idea_id])
    end
end
