class SearchController < ApplicationController
  def index
    if params[:q]
      type = case params[:type]
      when 'discussion'
        @type = :discussion
        @search = Search::WipSearch.new(params[:q], params[:state])
        @discussion_total = @search.total
      else
        @type = :product
        @search = Search::ProductSearch.new(params[:q], params[:tech])
        @product_total = @search.total
      end

      @product_total ||= Search::ProductSearch.new(params[:q]).total
      @discussion_total ||= Search::WipSearch.new(params[:q]).total
    end
  end
end