class AppsController < ApplicationController
  respond_to :html, :json

  def index
    @products = AppsQuery.new(current_user, params[:filter]).perform

    respond_with @products, each_serializer: AppSerializer
  end
end
