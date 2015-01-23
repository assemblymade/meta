class DashboardController < ApplicationController
  before_action :authenticate_user!

  respond_to :html, :json

  def index
    # FIXME: Have an object to the heavy lifting here
    if current_user.top_products.empty?
      product_vectors = QueryMarks.new.get_all_product_vectors
      user_vector = QueryMarks.new.mark_vector_for_object(current_user)
      QueryMarks.new.assign_top_products_for_user(10, current_user, product_vectors, user_vector)
    end

    dashboard = DashboardQuery.call(current_user, params.fetch(:filter, 'interests'))

    @news_feed_items = dashboard.news_feed_items
    @user_bounties = dashboard.user_bounties
    @heartables = dashboard.heartables
    @user_hearts = dashboard.user_hearts
    @products = dashboard.followed_products
  end

  def news_feed_items
    dashboard = DashboardQuery.call(current_user, params.fetch(:filter, 'interests'))

    render json: dashboard.news_feed_items,
      each_serializer: NewsFeedItemSerializer,
      serializer: PaginationSerializer,
      root: :news_feed_items
  end
end
