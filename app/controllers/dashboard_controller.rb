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

    dashboard = Dashboard.new(current_user, params[:filter])
    respond_with dashboard, root: :dashboard
  end

  def news_feed_items
    query = DashboardQuery.new(current_user, filter_param, params[:page])

    render json: query.find_news_feed_items,
      each_serializer: NewsFeedItemSerializer,
      serializer: PaginationSerializer,
      root: :news_feed_items
  end

  def filter_param
    params.fetch(:filter, 'interests')
  end
end
