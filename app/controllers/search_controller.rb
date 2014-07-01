class SearchController < ApplicationController

  layout :search_layout

  def index
    set_product if params[:product_id]

    if params[:q]
      @totals = Search::Totals.new(params[:q])

      @filters = filters = { q: params[:q] }
      @filters[:type] = params[:type] if params[:type]
      @filters[:state] = params[:state] if params[:state]
      @filters[:tech] = params[:tech] if params[:tech]

      filters = @filters.clone
      if params[:product_id]
        filters[:product_id] = params[:product_id]
      end

      if @product
        params[:type] = 'discussion' if params[:type].blank? # default search type on product page is discussion
      else
        params[:type] = 'product' if params[:type].blank?
      end

      type = case params[:type]
      when 'discussion'
        @type = :discussion
        @search = Search::WipSearch.new(params[:q], filters)
        @totals.discussions = @search.total
      else
        @type = :product
        @search = Search::ProductSearch.new(params[:q], filters)
        @totals.products = @search.total
      end
    end
  end

  def search_layout
    params[:product_id] ? 'product' : 'global'
  end
end
