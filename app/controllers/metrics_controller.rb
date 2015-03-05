class MetricsController < ProductController
  respond_to :html, :json

  before_action :authenticate_staff!, except: :snippet

  def index
    find_product!

    snippet = render_to_string(partial: 'metrics/snippet', layout: false, formats: 'html')

    respond_to do |format|
      format.html
      format.json do
        render json: ProductSerializer.new(@product).as_json.merge(asmlytics_snippet: snippet)
      end
    end
  end

  def snippet
    find_product!
    authorize! :update, @product

    snippet = render_to_string(partial: 'metrics/snippet', layout: false, formats: 'html')

    respond_to do |format|
      format.html
      format.json do
        render json: ProductSerializer.new(@product).as_json.merge(asmlytics_snippet: snippet)
      end
    end
  end

  def weekly
    find_product!
    render json: @product.weekly_metrics.page(params[:page])
  end

  def daily
    find_product!
    render json: @product.daily_metrics.page(params[:page])
  end

  def find_product!
    @product = super

    if @product.meta?
      raise ActiveRecord::RecordNotFound unless current_user.try(:staff?)
    end
  end
end
