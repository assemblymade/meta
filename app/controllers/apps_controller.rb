class AppsController < ApplicationController
  respond_to :html, :json

  PER_PAGE=30

  def index
    @showcases = Showcase.active.order(:slug)
    @topics = Topic.all

    respond_to do |format|
      format.json do
        @apps = if params[:search].present?
          Search::ProductSearch.new(params[:search]).results
        else
          AppsQuery.new(current_user, params).perform.page(params[:page]).per(PER_PAGE)
        end

        respond_with(@apps, each_serializer: AppSerializer)
      end
      format.html do
        if params[:search].blank?
          @products_count = AppsQuery.new(current_user, params).perform.count
          @total_pages = (@products_count / PER_PAGE.to_f).ceil
        end
      end
    end
  end
end
