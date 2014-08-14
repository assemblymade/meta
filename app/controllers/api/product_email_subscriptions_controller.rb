module Api
  class ProductEmailSubscriptionsController < ApplicationController
    protect_from_forgery with: :null_session, if: Proc.new { |c| c.request.format == 'application/json' }

    def create
      ProductEmailSubscription.create!(product_id: product_id, email: params[:email])
    end

    def destroy
      if subscription = ProductEmailSubscription.find_by(product_id: product_id, email: params[:email])
        subscription.destroy!
      end
    end

    def product_id
      Product.find_by(slug: params[:product_id]).pluck(:id)
    end
  end
end
