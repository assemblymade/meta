class AppsController < ApplicationController
  respond_to :html, :json

  def index
    if params[:search].blank? && params[:topic].blank? && params[:showcase].blank?
      @showcases = Showcase.active.order(:slug)
    end

    @topics = Topic.all

    respond_to do |format|
      format.json do
        @products = if params[:search].present?
          Search::ProductSearch.new(params[:search]).results
        else
          AppsQuery.new(current_user, params).perform.page(params[:page]).per(30)
        end

        respond_with @products, each_serializer: AppSerializer
      end
      format.html do
        if params[:search].blank?
          @products_count = AppsQuery.new(current_user, params).perform.count
        end
      end
    end
  end
end
