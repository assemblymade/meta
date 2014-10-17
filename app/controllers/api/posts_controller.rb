module Api
  class PostsController < ApplicationController
    respond_to :json
    after_filter :set_access_control_headers

    protect_from_forgery with: :null_session, if: Proc.new { |c| c.request.format == 'application/json' }

    def create
      set_product_and_authenticate!
      set_user_and_authenticate!
      #%B %d, %Y at %M:%S
      new_params = post_params.merge(title: "#{post_params[:title]} on #{Time.now.strftime('%B %d, %Y, at %T')}" )

      @post = @product.posts.new(new_params)
      @post.author = @user

      if @post.save
        publish!
      end

      respond_with @post, status: 201, location: product_post_url(@product, @post)
    end

    private

    def publish!
      Activities::Post.publish!(
        actor: @post.author,
        subject: @post,
        target: @product
      )
    end

    def set_product_and_authenticate!
      @product = Product.find_by(slug: params[:product_id])

      unless @product.authentication_token == params[:token]
        response = { status: 401, message: "Invalid product token" }
        respond_with response, status: 401
      end
    end

    def set_user_and_authenticate!
      unless @user = User.find_by(authentication_token: params[:user_token])
        response = { status: 401, message: "Invalid user token" }
        respond_with response, status: 401
      end
    end

    def post_params
      params.require(:post).permit(:title, :body)
    end

    def set_access_control_headers
      headers['Access-Control-Allow-Origin'] = '*'
      headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE'
      headers['Access-Control-Request-Method'] = '*'
      headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept'
    end
  end
end
