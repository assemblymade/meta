module Api
  class NewsFeedItemsController < ApplicationController
    respond_to :json
    after_filter :set_access_control_headers

    protect_from_forgery with: :null_session, if: Proc.new { |c| c.request.format == 'application/json' }

    def create
      set_product_and_authenticate!
      set_user_and_authenticate!

      @item = @product.news_feed_items.new(
        source_id: @user.id,
        target: NewsFeedItemPost.create(title: @user.username, description: params[:message])
      )

      if @item.save
        publish!
      end

      respond_with @item, status: 201, location: api_product_updates_url(@product)
    end

    private

    def publish!
      Activities::NewsFeedItem.publish!(
        actor: @user,
        subject: @item,
        target: @product
      )
    end

    def set_product_and_authenticate!
      @product = if params[:product_id].uuid?
        Product.find(params[:product_id])
      else
        Product.find_by(slug: params[:product_id])
      end

      unless @product.authentication_token == params[:token]
        response = { status: 401, message: "Invalid product token" }
        respond_with response, status: 401
      end
    end

    def set_user_and_authenticate!
      unless @user = User.find_by(authentication_token: params[:user_token])
        response = { status: 401, message: "Invalid user token" }
        respond_with response, status: 401, location: api_product_updates_url(@product)
      end
    end

    def set_access_control_headers
      headers['Access-Control-Allow-Origin'] = '*'
      headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE'
      headers['Access-Control-Request-Method'] = '*'
      headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept'
    end
  end
end
