module Api
  class PotentialUsersController < ApplicationController
    respond_to :json
    before_filter :set_access_control_headers

    protect_from_forgery with: :null_session, if: Proc.new { |c| c.request.format == 'application/json' }

    def create
      email = params[:email]
      product = Product.find_by!(slug: params[:product_id])
      subscription = PotentialUser.create!(product_id: product.id, email: email)

      if user = User.find_by(email: email)
        ProductMailer.delay(queue: 'mailer').potential_user_with_account(product, user)
      else
        ProductMailer.delay(queue: 'mailer').potential_user(product, email)
      end

      Activities::Subscribe.publish!(
        actor: subscription,
        subject: product,
        target: product
      )

      respond_with subscription, location: root_url
    end

    def destroy
      if subscription = PotentialUser.find_by(product_id: product_id, email: params[:email])
        subscription.destroy!
      end

      respond_with nil, location: root_url
    end

    def product_id
      Product.where(slug: params[:product_id]).pluck(:id).first
    end

    def set_access_control_headers
      headers['Access-Control-Allow-Origin'] = '*'
      headers['Access-Control-Allow-Methods'] = 'POST, DELETE'
      headers['Access-Control-Request-Method'] = '*'
      headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept'
    end
  end
end
