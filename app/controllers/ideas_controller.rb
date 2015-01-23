class IdeasController < ProductController
  respond_to :html, :json
  layout 'application'

  before_action :authenticate_user!, only: [:new, :create, :edit, :update, :admin]

  IDEAS_PER_PAGE = 12

  def admin
    return unless current_user.is_staff?

    find_idea!

    respond_with({
      idea: IdeaSerializer.new(@idea),
      topics: Idea::TOPIC_NAMES.map.with_index do |name, i|
        {
          name: name,
          slug: Idea::TOPIC_SLUGS[i]
        }
      end
    })
  end

  def create
    @idea = Idea.create_with_discussion(current_user, idea_params)
    if @idea.valid?
      @idea.add_marks(params[:idea][:tag_list])

      respond_with @idea
    else
      render :new
    end
  end

  def index
    ideas = FilterIdeasQuery.call(filter_params)
    total_pages = (ideas.count / IDEAS_PER_PAGE.to_f).ceil
    @stores[:pagination_store] = {
      current_page: params[:page] || 1,
      total_pages: total_pages
    }

    @heartables = ideas.map(&:news_feed_item)
    @user_hearts = if signed_in?
      Heart.where(user_id: current_user.id).where(heartable_id: @heartables.map(&:id))
    end

    @ideas = ideas.page(params[:page]).per(IDEAS_PER_PAGE)

    respond_with({
      heartables: @heartables,
      ideas: ActiveModel::ArraySerializer.new(@ideas),
      total_pages: total_pages,
      user_hearts: @user_hearts
    })
  end

  def new
    respond_with({
      related_ideas: ActiveModel::ArraySerializer.new(
        Idea.take(2),
        each_serializer: IdeaSerializer
      )
    })
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

    related_ideas = Idea.with_mark(@marks.first).limit(2)
    related_ideas = related_ideas.empty? ? Idea.limit(2) : related_ideas

    respond_with({
      idea: IdeaSerializer.new(@idea),
      comments: @comments,
      heartables: @heartables || [],
      related_ideas: ActiveModel::ArraySerializer.new(
        related_ideas,
        each_serializer: IdeaSerializer
      ),
      user_hearts: @user_hearts || []
    })
  end

  def start_conversation
    find_idea!
    authorize! :update, @idea

    respond_with IdeaSerializer.new(@idea)
  end

  def edit
    find_idea!
    authorize! :update, @idea

    respond_with IdeaSerializer.new(@idea)
  end

  def update
    find_idea!
    authorize! :update, @idea

    @idea.update(idea_params)

    respond_to do |format|
      format.json  { render json: IdeaSerializer.new(@idea), status: 200 }
    end
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
    params.require(:idea).permit([
      :name,
      :body,
      :founder_preference,
      :flagged_at,
      :topics => []
    ])
  end

  def filter_params
    params.permit([:filter, :mark, :sort, :user])
  end
end
