class IdeasController < ProductController
  respond_to :html, :json
  layout 'ideas'

  before_action :authenticate_user!, only: [:new, :create, :edit, :update, :admin, :up_score, :down_score]

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

  def up_score
    return unless current_user.is_staff?
    @idea = Idea.find_by(slug: params[:idea_id])
    if @idea
      score = @idea.score * 2
      @idea.update!({score: score})
    end
    render json: {}
  end

  def down_score
    return unless current_user.is_staff?
    @idea = Idea.find_by(slug: params[:idea_id])
    if @idea
      score = @idea.score / 2
      @idea.update!({score: score})
    end
    render json: {}
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
    respond_to do |format|
      format.html
      format.json do
        @ideas = FilterIdeasQuery.call(filter_params).
                  page(params[:page]).per(IDEAS_PER_PAGE)

        total_pages = @ideas.total_pages

        store_data pagination_store: {
          current_page: params[:page] || 1,
          total_pages: total_pages
        }

        @heartables = @ideas.map(&:news_feed_item)
        if signed_in?
          store_data user_hearts: Heart.where(user_id: current_user.id).where(heartable_id: @heartables.map(&:id))
        end

        respond_with({
          categories: categories,
          heartables: @heartables,
          ideas: ActiveModel::ArraySerializer.new(@ideas),
          topics: topics,
          total_pages: total_pages,
          user_hearts: @user_hearts
        })
      end
    end
  end

  def new
    respond_with({})
  end

  def checklistitems
    @idea = Idea.find(params[:idea_id])
    render json: ChecklistHandler.new.checklists(@idea)
  end

  def show
    find_idea!

    @marks = @idea.marks.map(&:name)

    if nfi = @idea.news_feed_item
      @heartables = ([nfi] + nfi.comments).to_a
      store_data heartables: @heartables
      if signed_in?
        store_data user_hearts: Heart.where(user_id: current_user.id).where(heartable_id: @heartables.map(&:id))
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
      :tentative_name,
      :topics => [],
      :categories => [],
      :mark_names => [],

    ])
  end

  def filter_params
    params.permit([:filter, :mark, :sort, :topic, :user])
  end

end
