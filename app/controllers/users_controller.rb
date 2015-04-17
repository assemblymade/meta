class UsersController < ApplicationController
  respond_to :html, :json

  before_action :set_user, only: [:update, :dismiss_welcome_banner, :dismiss_showcase_banner, :flag, :unflag]

  def show
    set_user

    @products = @user.involved_products
    store_data(products: @products)

    default_filters = {
      user: 'assigned',
      sort: ['commented', 'awarded'].exclude?(params[:user]) && 'newest'
    }.with_indifferent_access

    filters = default_filters.merge(params.slice(:user, :state, :page))
    @wips = FilterWipsQuery.call(Task.all, @user, filters)

    set_empty_state if @wips.empty?

    @show_karma = current_user && current_user.staff?

    @preferences = QueryMarks.new.legible_mark_vector(@user.user_identity.get_mark_vector.take(10))

    respond_with @user
  end

  def edit
    authenticate_user!
    @user = current_user.decorate
    @balance = User::Balance.new(current_user)
  end

  def flag
    @user.flag!

    respond_with @user
  end

  def unflag
    @user.unflag!

    respond_with @user
  end

  def assets
    authenticate_user!
    @show_karma = current_user && current_user.staff?
    @user = User.find_by(username: params[:id]).decorate
    @assets = @user.assembly_assets.group_by { |asset| asset.product }
  end

  def karma
    @show_karma = current_user && current_user.staff?
    @user = User.find_by(username: params[:id]).decorate
    @deeds = Karma::Kronikler.new.deeds_by_user(@user.id).reverse
    @karma_product_history = Karma::Kronikler.new.karma_product_history_by_user(@user.id)

    @pi_chart_data = Karma::Kalkulate.assemble_karma_pie_chart(@karma_product_history)

    @karma_product_data = Karma::Kalkulate.assemble_karma_product_history(@karma_product_history)
    @karma_total_history = [['Date' ,'Bounties', 'Tips', 'Invites', 'Products']]
    @karma_total_history = @karma_total_history + @karma_history
    @karma_aggregate_data = Karma::Kronikler.new.aggregate_karma_info_per_user(@user.id)
  end

  def update
    @balance = User::Balance.new(current_user)
    current_user.update(user_params)
    respond_with current_user
  end

  def dismiss_welcome_banner
    @user.update(welcome_banner_dismissed_at: Time.now)

    render nothing: true, status: 204
  end

  def dismiss_showcase_banner
    @user.update(showcase_banner_dismissed_at: Time.now)

    render nothing: true, status: 204
  end

  def heart_stories
    set_user
    query = HeartStoriesQuery.new(@user, params)

    render json: {
      nfis: ActiveModel::ArraySerializer.new(query.nfis, each_serializer: HeartNFISerializer),
      comments: ActiveModel::ArraySerializer.new(query.comments, each_serializer: HeartCommentSerializer),
      users: ActiveModel::ArraySerializer.new(User.find(query.hearter_ids))
    }
  end

  def stories
    set_user

    if params.keys.include?('product_id')
      stories = @user.stories(100, Product.find_by(slug: params[:product_id]).id)
    else
      stories = @user.stories(100)
    end

    s_stories = stories.map do |a|
      r = TimelineStorySerializer.new(a)
    end

    products = @user.story_worthy_products.map{|a| [a.id, ProductShallowSerializer.new(a)]}.to_h
    r = {}
    r['stories'] = s_stories
    r['products'] = products

    render json: r
  end

  def awarded_bounties
    set_user
    query = AwardedBountiesQuery.new(@user, params)

    balances = TransactionLogEntry.product_balances(@user)

    render json: {
      awards: json_array(query.awards),
      coins: balances,
      counts: Award.where(winner: @user).joins(:wip).group(:product_id).count,
      totals: TransactionLogEntry.where(product_id: balances.keys).group(:product_id).sum(:cents)
    }
  end

  def search
    users = User.by_partial_match(params[:query]).order(:name)
    suggestions = users.map do |user|
      { value: user.name,
        id: user.id,
        facebook: user.facebook_uid?,
        password: user.encrypted_password?,
        avatar_url: user.avatar.url(60).to_s
      }
    end

    render json: {
      suggestions: suggestions
    }
  end

  def unread
    authenticate_user!
    entries = UnreadChat.for(current_user)

    render json: entries.sort_by{|e| [-e[:count], e[:index]]}
  end

  def tracking
    url = ReadraptorTracker.new(params[:article_id], current_user.id).url

    # make request to Readraptor to mark the article as read
    ReadRaptor::ReadArticle.perform_async(url)

    render json: url
  end

  def delete_account
    authorize! :delete, User
    @user = User.find_by!(username: params[:id])
    @user.update!(deleted_at: Time.now)
    DeleteUserAccount.perform_async(@user.id)
    render nothing: true, status: 200
  end

  if Rails.env.development?
    def impersonate
      sign_in(:user, User.find(params[:id]))
      redirect_to (params[:return_to] || root_url)
    end
  end

protected

  def user_params
    params.require(:user).permit(
      :name,
      :username,
      :email,
      :location,
      :bio,
      :mail_preference,
      :beta_subscription,
      mark_names: []
    )
  end

  def set_user
    if params[:id]
      @user = UserDecorator.find_by!(username: params[:id])
    elsif signed_in?
      return redirect_to user_path(current_user)
    else
      warden.authenticate!
    end
    @user = @user.decorate
  end

  def page
    [params[:page].to_i, 1].max
  end

  def viewing_self?
    signed_in? && current_user == @user
  end

  def set_empty_state
    if params[:user].blank?
      @empty_state_text = "@#{@user.username} isn't working on any bounties"
    elsif params[:user] == 'started'
      @empty_state_text = "@#{@user.username} hasn't created any bounties"
    elsif params[:user] == 'commented'
      @empty_state_text = "@#{@user.username} hasn't commented on any bounties"
    elsif params[:user] == 'awarded'
      @empty_state_text = "@#{@user.username} hasn't been awarded any bounties"
    end
  end

end
