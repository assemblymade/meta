module Api
  class SubscribersController < Api::ApiController
    respond_to :json
    before_filter :set_access_control_headers

    protect_from_forgery with: :null_session, if: Proc.new { |c| c.request.format == 'application/json' }

    def create
      email = params.require(:email)
      product = Product.find_by!(slug: params[:product_id])

      if user = User.find_by(email: email)
        subscription = subscribe_user(product, user)
      else
        subscription = subscribe_email(product, email)
      end

      respond_with subscription, location: root_url
    end

    def destroy
      if subscription = Subscriber.find_by(product_id: product_id, email: params[:email])
        subscription.destroy!
      end

      respond_with nil, location: root_url
    end

    # private

    def subscribe_user(product, user)
      subscription = Subscriber.find_by(product_id: product.id, user_id: user.id)

      if subscription.nil?
        subscription = product.announcements!(user)

        Activities::Subscribe.publish!(
          actor: user,
          subject: product,
          target: product
        )
      end

      if params[:product_id] == 'assemblycoins'
        ProductMailer.delay(queue: 'mailer').new_promo_subscriber_with_account(product, user)
      else
        ProductMailer.delay(queue: 'mailer').new_subscriber_with_account(product, user)
      end

      subscription
    end

    def subscribe_email(product, email)
      subscription = Subscriber.find_or_create_by!(product_id: product.id, email: email)
      if subscription.new_record?
        Activities::Subscribe.publish!(
          actor: subscription,
          subject: product,
          target: product
        )
      end

      if params[:product_id] == 'assemblycoins'
        ProductMailer.delay(queue: 'mailer').new_promo_subscriber(product, email)
      else
        ProductMailer.delay(queue: 'mailer').new_subscriber(product, email)
      end

      subscription
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
