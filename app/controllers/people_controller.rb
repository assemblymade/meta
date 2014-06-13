class PeopleController < ApplicationController
  respond_to :html, :json

  before_action :set_product
  before_action :authenticate_user!, :except => [:index]

  def index
    @memberships = @product.team_memberships.active

    @selected_filter = params[:filter]
  end

  def create
    @membership = @product.team_memberships.find_or_create_by!(user: current_user, is_core: false)

    membership = params[:membership]
    interests = params[:membership][:interest_ids] unless membership.nil?

    update_interests(interests)

    @membership.update_attributes({
      deleted_at: nil,
      bio: params[:bio]
    })

    respond_to do |format|
      format.json { render json: { count: @product.team_memberships.active.count } }
      format.html { redirect_to request.referrer }
    end
  end

  def update
    @membership = @product.team_memberships.find_by(user: current_user)

    unless @membership.nil?
      @membership.update_attribute(:bio, params[:bio])
    end

    respond_to do |format|
      format.json { render json: { user: @membership } }
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

    unless interests.nil?
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

end
