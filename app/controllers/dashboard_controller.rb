class DashboardController < ApplicationController
  before_action :authenticate_user!

  respond_to :html, :json

  def index
    product_vectors = QueryMarks.new.get_all_product_vectors
    user_vector = QueryMarks.new.mark_vector_for_object(current_user)
    QueryMarks.new.assign_top_products_for_user(10, current_user, product_vectors, user_vector)

    @news_feed_items = NewsFeedItem.joins(:product).merge(products).includes(:comments).for_feed.page(1)
    @user_bounties = {
      lockedBounties: current_user.locked_wips,
      reviewingBounties: Task.joins(:product).merge(current_user.core_products).where(state: 'reviewing')
    }.transform_values { |bounties| ActiveModel::ArraySerializer.new(bounties, each_serializer: BountySerializer).as_json }

    @heartables = @news_feed_items + @news_feed_items.map(&:comments).flatten
    @user_hearts = signed_in? && Heart.where(user_id: current_user.id, heartable_id: @heartables.map(&:id))

    @products = ActiveModel::ArraySerializer.new(suggested_products).as_json unless @news_feed_items.present?
  end

  # FIXME: Create a query object to handle all this junk
  def news_feed_items
    items = NewsFeedItem.where(target_type: 'Wip').
      joins(:product).merge(products).
      for_feed.
      page(params[:page])

    render json: items,
      each_serializer: NewsFeedItemSerializer,
      serializer: PaginationSerializer,
      root: :news_feed_items
  end

  def products
    filter_param = params.fetch(:filter, 'interests')

    case filter_param
    when 'all'
      Product.public_products
    when 'following'
      current_user.followed_products
    when 'interests'
      product_ids = current_user.top_products.pluck(:product_id)
      Product.where(id: product_ids)
    else
      Product.where(slug: filter_param)
    end
  end

  def suggested_products
    Product.public_products.ordered_by_trend.limit(3)
  end
end
