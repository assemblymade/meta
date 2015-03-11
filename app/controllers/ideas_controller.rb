class IdeasController < ProductController
  respond_to :html, :json
  layout 'ideas'

  before_action :authenticate_user!, only: [:new, :create, :edit, :update, :admin]

  IDEAS_PER_PAGE = 12

  def admin
    return unless current_user.is_staff?

    find_idea!

    respond_with({
      categories: categories,
      idea: IdeaSerializer.new(@idea),
      topics: topics
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
    @ideas = FilterIdeasQuery.call(filter_params).
      page(params[:page]).per(IDEAS_PER_PAGE)

    total_pages = @ideas.total_pages

    @stores[:pagination_store] = {
      current_page: params[:page] || 1,
      total_pages: total_pages
    }

    @heartables = @ideas.map(&:news_feed_item)
    @user_hearts = if signed_in?
      Heart.where(user_id: current_user.id).where(heartable_id: @heartables.map(&:id))
    end

    current_product = SevenDayMVP.current
    last_product = SevenDayMVP.recent.first

    respond_with({
      categories: categories,
      heartables: @heartables,
      ideas: ActiveModel::ArraySerializer.new(@ideas),
      topics: topics,
      total_pages: total_pages,
      user_hearts: @user_hearts,
      current_product: ProductSerializer.new(current_product),
      last_product: ProductSerializer.new(last_product)
    })
  end

  def new
    respond_with({})
  end

  def checklistitems
    puts params
    @idea = Idea.find_by(name: params[:idea_id])
    render json: @idea.checklist_items.map{|a| {state: a.state, type: a.checklist_type.name, description: a.checklist_type.description}}
  end

  def show
    find_idea!

    @marks = @idea.marks.map(&:name)

    if nfi = @idea.news_feed_item
      @heartables = ([nfi] + nfi.comments).to_a
      @user_hearts = if signed_in?
        Heart.where(user_id: current_user.id).where(heartable_id: @heartables.map(&:id))
      end
    end

    related_ideas = FilterIdeasQuery.call(mark: @marks.sample).where.not(id: @idea.id)
    related_ideas = (related_ideas.empty? ?
      FilterIdeasQuery.call.where.not(id: @idea.id) : related_ideas).limit(2)

    respond_with({
      idea: IdeaSerializer.new(@idea),
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

  def categories
    Idea::CATEGORY_NAMES.map.with_index { |name, i|
      {
        name: name,
        slug: Idea::CATEGORY_SLUGS[i]
      }
    }
  end

  def topics
    Idea::TOPIC_NAMES.map.with_index { |name, i|
      {
        name: name,
        slug: Idea::TOPIC_SLUGS[i]
      }
    }
  end

  def find_idea!
    @idea = Idea.friendly.find(params[:id])
  end

  def idea_params
    params.require(:idea).permit([
      :name,
      :body,
      :flagged_at,
      :founder_preference,
      :topics => [],
      :categories => [],
      :mark_names => []
    ])
  end

  def filter_params
    params.permit([:filter, :mark, :sort, :topic, :user])
  end

end
