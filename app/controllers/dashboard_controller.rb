class DashboardController < ApplicationController
  before_action :authenticate_user!

  respond_to :html, :json

  def index
    # FIXME: Have an object to the heavy lifting here
    dashboard = DashboardQuery.call(current_user, params.fetch(:filter, 'interests'))

    @news_feed_items = dashboard.news_feed_items
    @user_bounties = dashboard.user_bounties
    @heartables = dashboard.heartables
    @user_hearts = dashboard.user_hearts
  end

  def news_feed_items
    dashboard = DashboardQuery.call(current_user, params.fetch(:filter, 'interests'))

    render json: dashboard.news_feed_items,
      each_serializer: NewsFeedItemSerializer,
      serializer: PaginationSerializer,
      root: :news_feed_items
  end
end
