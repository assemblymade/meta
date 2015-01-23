class AppsController < ApplicationController
  respond_to :html, :json

  def index
    respond_to do |format|
      format.json do
        @products = if params[:search].present?
          Search::ProductSearch.new(params[:search]).results
        else
          AppsQuery.new(current_user, params[:filter], params[:topic]).perform.limit(27)
        end

        respond_with @products, each_serializer: AppSerializer
      end
      format.html do
        if params[:search].blank?
          @products_count = AppsQuery.new(current_user, params[:filter], params[:topic]).perform.count
        end
      end
    end
  end
end
