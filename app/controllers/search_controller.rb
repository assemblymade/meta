class SearchController < ApplicationController
  def index
    if params[:q]
      @search = ProductSearch.new(params[:q], params[:tech])
    end
  end
end