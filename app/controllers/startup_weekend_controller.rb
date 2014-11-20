class StartupWeekendController < ApplicationController
  def index
    @news_feed_items = NewsFeedItem.joins(:product).
      merge(Product.startup_weekend).
      page(params[:page]).per(10).
      order(updated_at: :desc).
      map { |nfi| NewsFeedItemSerializer.new(nfi) }

    respond_to do |format|
      format.html
      format.json { render json: @news_feed_items }
    end
  end
end
