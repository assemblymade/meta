class DashboardController < ApplicationController
  respond_to :html

  def index
    posts = NewsFeedItem.joins(:product).merge(products).for_feed.limit(20)
    @news_feed_items = ActiveModel::ArraySerializer.new(posts).as_json
    @bounties = current_user.locked_wips
    @products = ActiveModel::ArraySerializer.new(suggested_products).as_json unless posts.present?
  end

  def products
    case params.fetch(:filter, 'all')
    when 'all'
      Product.public_products
    when 'following'
      current_user.followed_products
    when 'interests'
      product_ids = current_user.top_products.pluck(:product_id)
      Product.where(id: product_ids)
    end
  end

  def suggested_products
    Product.public_products.ordered_by_trend.limit(3)
  end
end
