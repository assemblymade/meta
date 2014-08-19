class DiscoverController < ApplicationController

  def fresh
    @applications = PitchWeekApplication.in_pitch_week.approved.
      joins(:product).
      order('products.bio_memberships_count desc').
      page(params[:page])
  end

  def trending
    @products = Product.public_products.
                        where.not(started_building_at: nil).
                        where(live_at: nil).
                        joins(:product_trend).
                        where('watchings_count >= ?', 10).
                        order('product_trends.score desc').
                        page(params[:page])
  end

  def live
    @products = Product.public_products.
                        where.not(live_at: nil).
                        joins(:product_trend).
                        order('product_trends.score desc').
                        page(params[:page])
  end

  def blog
    @posts = Post.joins(:product).
      where('products.flagged_at is null').
      order(created_at: :desc)

    @page = @posts.page(params[:page])
  end
end
