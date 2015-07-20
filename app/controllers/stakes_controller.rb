class StakesController < ProductController
  before_action :set_product

  def show
    @report = TransactionLogReport.new(@product)
    respond_to do |format|
      format.csv { render csv: @report, filename: @product.slug, layout: false }
    end
  end
end
