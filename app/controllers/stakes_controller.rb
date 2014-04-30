class StakesController < ApplicationController
  before_action :set_product

  def show
    @report = TransactionLogReport.new(TransactionLogEntry.where(product_id: @product.id).order(:created_at).to_a)
    respond_to do |format|
      format.csv { render csv: @report, filename: @product.slug, layout: false }
    end
  end
end