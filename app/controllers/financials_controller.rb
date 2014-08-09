class FinancialsController < ProductController
  before_action :find_product!

  def index
    @reports = ProfitReport.where(product: @product).order(:end_at)
    if @reports.empty?
      redirect_to product_path(@product)
    end
  end
end
