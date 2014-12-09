class TeamMembershipsController < ProductController
  def show
    find_product!
    @membership = @product.team_memberships.find(params[:id])
  end
end
