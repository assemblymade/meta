class TeamMembershipsController < ProductController
  def show
    find_product!
    @membership = @product.team_memberships.find(params[:id])
    @news_feed_item = @membership.news_feed_item
  end
end
