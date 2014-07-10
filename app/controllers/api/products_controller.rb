module Api
  class ProductsController < ApplicationController
    respond_to :json

    def workers
      @product = Product.find_by!(slug: params[:product_id])
      @workers = @product.core_team.map do |u|
        last_worker = u.wip_workers.joins(:wip).where(wips: {product_id: @product.id}).order(:created_at).last
        {
          user: UserSerializer.new(u),
          work: {
            started_at: last_worker.created_at.iso8601,
            wip: WipSerializer.new(last_worker.wip)
          }
        }
      end

      respond_with @workers
    end
  end
end
