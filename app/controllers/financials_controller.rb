class FinancialsController < ProductController
  before_action :find_product!

  def index
    @reports = ProfitReport.where(product: @product).order(end_at: :desc)
    data = Finance.new.revenue_reports(@product)
    @moneystream =  data
  end
end
