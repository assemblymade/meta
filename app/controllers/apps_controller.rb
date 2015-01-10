class AppsController < ApplicationController
  respond_to :html, :json

  def index
    @products = case
    when params[:filter] == 'mine'
      Product.where(user: current_user).ordered_by_trend.limit(30)
    else
      Product.ordered_by_trend.limit(30)
    end

    respond_with @products, each_serializer: AppSerializer
  end
end
