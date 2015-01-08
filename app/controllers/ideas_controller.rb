class IdeasController < ApplicationController
  respond_to :html, :json
  layout 'application'

  before_action :authenticate_user!, only: [:new, :create, :edit, :update]

  def index
    ideas = FilterIdeasQuery.call(filter_params)

    @heartables = ideas.map(&:news_feed_item)
    @user_hearts = if signed_in?
      Heart.where(user_id: current_user.id).where(heartable_id: @heartables.map(&:id))
    end

    @ideas = ideas.page(params[:page]).per(20)

    respond_with @ideas
  end

  def new_ideas
    render 'new_ideas', layout: nil
  end

  def show
    find_idea!

    @comments = ActiveModel::ArraySerializer.new(
      @idea.news_feed_item.comments.order('created_at asc'),
      each_serializer: IdeaCommentSerializer
    ).as_json

    @marks = @idea.marks.map(&:name)

    if nfi = @idea.news_feed_item
      @heartables = ([nfi] + nfi.comments).to_a
      @user_hearts = if signed_in?
        Heart.where(user_id: current_user.id).where(heartable_id: @heartables.map(&:id))
      end
    end
  end

  def new
    @idea = Idea.new
  end

  def create
    @idea = current_user.ideas.create(idea_params)
    if @idea.valid?
      @idea.add_marks(params[:idea][:tag_list])
      redirect_to @idea
    else
      render :new
    end
  end

  def edit
    find_idea!
    authorize! :update, @idea
  end

  def update
    find_idea!
    @idea.update_attributes(idea_params)
    redirect_to @idea
  end

  def mark
    idea = Idea.friendly.find(params[:idea_id])
    if idea
      idea.add_marks(params[:idea][:tag_list])
    end
    render json: idea.marks.as_json
  end

  private

  def find_idea!
    @idea = Idea.friendly.find(params[:id])
  end

  def idea_params
    params.require(:idea).permit([:name, :body])
  end

  def filter_params
    params.permit([:filter, :mark, :sort, :user])
  end
end
