class SearchController < ApplicationController
  def index
    set_product if params[:product_id]

    if params[:q]
      @filters = filters = { q: params[:q] }
      @filters[:state] = params[:state] if params[:state]
      @filters[:tech] = params[:tech] if params[:tech]
      filters[:product_id] = params[:product_id] if params[:product_id]

      if @product
        params[:type] = 'discussion' if params[:type].blank? # default search type on product page is discussion
      else
        params[:type] = 'product' if params[:type].blank?
      end

      type = case params[:type]
      when 'discussion'
        @type = :discussion
        @search = Search::WipSearch.new(params[:q], filters)
        @discussion_total = @search.total
      else
        @type = :product
        @search = Search::ProductSearch.new(params[:q], filters)
        @product_total = @search.total
      end

      @product_total ||= Search::ProductSearch.new(params[:q]).total
      @discussion_total ||= Search::WipSearch.new(params[:q]).total
    end
  end
end