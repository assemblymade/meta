module Api
  class SubscribersController < ApplicationController
    respond_to :json
    after_filter :set_access_control_headers

    protect_from_forgery with: :null_session, if: Proc.new { |c| c.request.format == 'application/json' }

    def create
      email = params[:email]
      product = Product.find_by!(slug: params[:product_id])
      subscription = Subscriber.find_or_create_by!(product_id: product.id, email: email)

      if user = User.find_by(email: email)
        if product.followed_by?(user)
          subscription = Watching.find_by(product: product, user: user)
        else
          subscription = Subscriber.upsert!(product, user)
        end

        if params[:product_id] == 'assemblycoins'
          ProductMailer.delay(queue: 'mailer').new_promo_subscriber_with_account(product, user)
        else
          ProductMailer.delay(queue: 'mailer').new_subscriber_with_account(product, user)
        end
      else
        subscription = Subscriber.create!(product_id: product.id, email: email)

        if params[:product_id] == 'assemblycoins'
          ProductMailer.delay(queue: 'mailer').new_promo_subscriber(product, email)
        else
          ProductMailer.delay(queue: 'mailer').new_subscriber(product, email)
        end
      end

      Activities::Subscribe.publish!(
        actor: subscription,
        subject: product,
        target: product
      )

      respond_with subscription, location: root_url
    end

    def destroy
      if subscription = Subscriber.find_by(product_id: product_id, email: params[:email])
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
