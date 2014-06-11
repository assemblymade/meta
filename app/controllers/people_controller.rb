class PeopleController < ApplicationController
  respond_to :html, :json

  before_action :set_product

  def index
    @interest_filters = Interest.joins(:product_interests).where('product_interests.product_id = ?', @product.id).distinct

    @memberships = @product.team_memberships

    @selected_filter = params[:filter]
  end

  def create
    @membership = @product.team_memberships.find_or_create_by!(user: current_user, is_core: false)
    @membership.update_attributes(deleted_at: nil)

    respond_to do |format|
      format.json { render json: { count: @product.team_memberships.active.count } }
    end
  end

  def destroy
    @membership = @product.team_memberships.find_by(user: current_user)

    unless @membership.nil?
      @membership.deleted_at = Time.now
      @membership.save!
    end

    respond_to do |format|
      format.json { render json: { count: @product.team_memberships.active.count } }
    end
  end

end
