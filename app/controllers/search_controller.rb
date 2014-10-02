class SearchController < ProductController

  layout :search_layout

  def index
    find_product! if params[:product_id].present?

    @totals = Search::Totals.new(params[:q])

    if @product
      if params[:type].blank? # default search type on product page is discussion
        params[:type] = 'discussion'
        params[:state] = 'open'
      end
    else
      params[:type] = 'product' if params[:type].blank?
    end

    @filters = {}
    @filters[:q] = params[:q] if params[:q].present?
    @filters[:type] = params[:type] if params[:type].present?
    @filters[:state] = params[:state] if params[:state].present?
    @filters[:tech] = params[:tech] if params[:tech].present?

    if params[:product_id]
      @filters[:product_id] = params[:product_id]
    end

    type = case params[:type]
    when 'discussion'
      @type = :discussion
      @search = Search::WipSearch.new(@filters)
      @totals.discussions = @search.total
    else
      @type = :product
      @search = Search::ProductSearch.new(params[:q], @filters)
      @totals.products = @search.total
    end

    @filter_description = [
      params[:state].try(:titleize) || 'All',
      @filters[:tech],
      @type.to_s.pluralize
    ].compact.join(' ')
  end

  def search_layout
    params[:product_id].present? ? 'product' : 'global'
  end
end
