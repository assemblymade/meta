class UsersController < ApplicationController
  respond_to :html, :json

  before_action :set_user, only: [:update, :unread_content]

  def show
    set_user
    @stream_events = viewing_self? ? @user.stream_events : @user.stream_events.visible
    @stream_events = @stream_events.page(page)
    respond_to do |format|
      format.js   { render :layout => false }
      format.html {
        @contributions = UserContribution.for(@user).
                                          sort_by{|c| -c.cents }.
                                          reject{|c| Product::PRIVATE.include?(c.product.slug) }
        respond_with @user
      }
    end
  end

  def edit
    authenticate_user!
    @user = current_user.decorate
  end

  def update
    @user.update_attributes(user_params)
    respond_with @user, location: (params[:return_to] || user_path(@user))
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
    unread_chats = ReadRaptorClient.new.unread_entities(current_user.id, :chat)

    @main_thread_updates = {}
    entities = ReadRaptorSerializer.deserialize(unread_chats)
    entities.each do |o|
      case o
      when Event::Comment
        wip = o.wip
        product = wip.product
        @main_thread_updates[product] ||= []
        @main_thread_updates[product] << o
      end
    end

    entries = current_user.recent_products.take(7).map.with_index do |product, i|
      product_events = @main_thread_updates[product] || []
      {
        product: ProductSerializer.new(product).as_json,
        count: product_events.size,
        entities: product_events.map{|e| [e.id, e.number] },
        index: i
      }
    end

    render json: entries.sort_by{|e| [-e[:count], e[:index]]}
  end

  def tracking
    render json: ReadraptorTracker.new(params[:article_id], current_user.id).url
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
      :mail_preference
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
end
