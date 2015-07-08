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
      format.html { redirect_to 'http://changelog.assembly.com/rfs' }
      format.json do
        render json: {}
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
    respond_to do |format|
      format.html { redirect_to "http://changelog.assembly.com/rfs/#{@idea.slug}" }
      format.json do
        render json: {}
      end
    end
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
