class Api::BountyPostingsController < ApplicationController
  before_action :authenticate_user!

  def create
    @product = Product.find_by!(slug: params[:product_id])
    @bounty = @product.tasks.find_by!(number: posting_params[:bounty])
    @posting = BountyPosting.find_by(bounty: @bounty) || BountyPosting.create!(poster: current_user, bounty: @bounty)
    @bounty.add_tag! posting_params[:tag]

    render json: @posting, status: 201
  end

  # private

  def posting_params
    params.permit(:bounty, :tag)
  end
end