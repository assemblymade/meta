class AwardsController < ApplicationController
  def show
    @product = Product.find_by!(slug: params[:product_id])
    @bounty = @product.tasks.find_by!(number: params[:task_id])
    @award = @bounty.awards.find(params[:id])
  end
end
