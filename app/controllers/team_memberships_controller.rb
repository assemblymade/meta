class TeamMembershipsController < ProductController
  def show
    find_product!
    @membership = @product.team_memberships.find(params[:id])
    @news_feed_item = @membership.news_feed_item
    store_data news_feed_item: @news_feed_item
  end
end
