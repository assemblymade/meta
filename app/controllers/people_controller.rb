class PeopleController < ApplicationController
  before_action :set_product

  def index
    @interest_filters = Interest.joins(:product_interests).where('product_interests.product_id = ?', @product.id).distinct

    @memberships = @product.team_memberships
  end
end