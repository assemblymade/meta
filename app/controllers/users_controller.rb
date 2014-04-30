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
        # @whatupdave magic added by @chrislloyd
        event_contributions = Event.joins(:wip).where(user_id: @user.id).group(:product_id).count
        work_contributions = Work.where(user_id: @user.id).group(:product_id).count

        contributions = event_contributions.merge(work_contributions) {|k, v1, v2| v1 + v2 }

        product_cents = Hash[TransactionLogEntry.product_balances(@user)]

        total_cents = TransactionLogEntry.product_totals

        @products = contributions.map do |product_id, contributions|
          cents = (product_cents[product_id] || 0)
          h = {
            product: Product.find(product_id),
            contributions: contributions,
            cents: cents,
          }
          h[:stake] = if cents > 0
            (cents / total_cents[product_id].to_f).tap{|v|
              puts "  #{h[:product].slug}  cents:#{cents}  total:#{total_cents[product_id].to_f}  = #{v}"

            }
          else
            0
          end

          h
        end.sort_by{|p| -p[:cents]}

        @products.reject!{|p| Product::PRIVATE.include?(p[:product].slug) }
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

  def unread_content
    unread_articles = ReadRaptorClient.new.unread_entities(@user.id)

    @products = WipGroup.new(
                  ReadRaptorSerializer.deserialize_articles(unread_articles)
                ).products
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
