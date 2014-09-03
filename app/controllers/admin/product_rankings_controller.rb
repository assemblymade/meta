class Admin::ProductRankingsController < AdminController
  def index
    @sort_column = Product.column_names.include?(params[:sort]) ? params[:sort] : "watchings_count"
    @sort_direction = %w[asc desc].include?(params[:direction]) ? params[:direction].to_sym : :desc
    @showRanked = %w[true false].include?(params[:showranked]) ? params[:showranked] : 'false'

    @products = Product.all.
      order("#{@sort_column} #{@sort_direction} NULLS LAST").
      page(params[:page]).per(200)

    if @showRanked == 'false'
      @products = @products.where('quality is null')
    end

    respond_to do |format|
      format.html { }
      format.json { render json: @products, each_serializer: ProductRankingSerializer }
    end
  end

  def update
    @product = Product.find(params[:id])

    quality = Integer(params[:quality]) rescue nil
    @product.update!(quality: quality)

    render nothing: true, status: :ok
  end
end