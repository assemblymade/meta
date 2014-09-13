class FinancialsController < ProductController
  before_action :find_product!

  def index
    @reports = ProfitReport.where(product: @product).order(end_at: :desc)
  end
end
