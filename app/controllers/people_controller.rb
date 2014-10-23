class PeopleController < ProductController
  respond_to :html, :json

  before_action :find_product!
  before_action :authenticate_user!, :except => [:index]

  def index
    @memberships = @product.team_memberships.active

    @followers = User.joins(:watchings)
      .where(watchings: { watchable_id: @product.id })
      .where(watchings: { unwatched_at: nil })
      .where.not(users: { id: @memberships.pluck('user_id') })
      .limit(100)
      .decorate

    if current_user
      membership = current_user
                  .team_memberships
                  .find_by(product_id: @product.id)

      if membership
        @current_user_interests = membership.team_membership_interests
                                  .map(&:interest)
                                  .map(&:slug)
      end
    end

    @selected_filter = params[:filter]
  end

  def create
    unless @membership = @product.team_memberships.find_by(user: current_user)
      @membership = @product.team_memberships.create!(user: current_user, is_core: false)
    end

    @membership.update_attributes({
      deleted_at: nil
    })

    respond_to do |format|
      format.json { render json: { count: @product.team_memberships.active.count } }
      format.html {
        flash[:joined] = true
        redirect_to product_people_path(@product)
      }
    end
  end

  def update
    unless @membership = @product.team_memberships.find_by(user: current_user)
      @membership = @product.team_memberships.create!(user: current_user, is_core: false)
    end

    update_interests(membership_params[:interests])

    bio_was = @membership.bio
    @membership.update(bio: membership_params[:bio])

    if @membership.bio.present? && bio_was.nil?
      process_introduction
    end

    respond_to do |format|
      format.json { render json: @membership, serializer: TeamMembershipSerializer }
      format.html { redirect_to product_people_path(@product) }
    end
  end

  def destroy
    @membership = @product.team_memberships.find_by(user: current_user, is_core: false)

    unless @membership.nil?
      @membership.update_attributes deleted_at: Time.now
    end

    respond_to do |format|
      format.json { render json: { count: @product.team_memberships.active.count } }
    end
  end

  private

  def update_interests(interests)
    current_interests = @membership.team_membership_interests.all
    added_interests = add_interests(interests)
    remove_interests(current_interests - added_interests)
  end

  def add_interests(interests)
    added_interests = []

    unless interests.blank?
      interests.each do |i|
        interest = Interest.find_or_create_by!(slug: i)
        added_interests << @membership.team_membership_interests.find_or_create_by!(interest: interest)
      end
    end

    added_interests
  end

  def remove_interests(interests)
    @membership.team_membership_interests.destroy(interests)
  end

  def membership_params
    params.require(:membership).permit({:interests => []}, :bio)
  end

  def process_introduction
    @product.partner_ids.each do |user_id|
      ProductMailer.delay(queue: 'mailer').new_introduction(user_id, @membership.id)
    end

    track_params = ProductAnalyticsSerializer.new(@product, scope: current_user).as_json
    track_event 'product.team.introduced', track_params

    NewsFeedItem.create_with_target(@membership)

    Activities::Introduce.publish!(
      actor: @membership.user,
      subject: @membership,
      target: @product
    )
  end

end
