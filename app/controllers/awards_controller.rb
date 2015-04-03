class AwardsController < ApplicationController
  def show
    @product = Product.find_by!(slug: params[:product_id])
    @bounty = Task.find_by!(number: params[:task_id])
    @guest = Guest.new(email: 'ddangerous@gmail.com')
    @award = Award.new(cents: 15_000)
  end
end
