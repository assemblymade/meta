module Api
  class ProductsController < ApplicationController
    respond_to :json
    after_filter :set_access_control_headers

    def info
      @product = Product.find_by!(slug: params[:product_id])
      @product_info = {
        name: @product.name,
        slug: @product.slug,
        pitch: @product.pitch,
        description: @product.try(:description),
        poster_image_url: @product.try(:poster_image_url),
        core_team: @product.core_team.map { |m| { avatar_url: m.avatar.url.to_s, username: m.username } }
      }

      respond_with @product_info
    end

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

    def get_product_from_params(params)
      if params[:product_id].uuid?
        Product.find(params[:product_id])
      else
        Product.find_by(slug: params[:product_id])
      end
    end

    def authorization
      @product = get_product_from_params(params)
      respond_with authorized: @product.authentication_token == params[:token]
    end

    def core_team
      @product = get_product_from_params(params)
      @user = User.find_by!(authentication_token: params[:token])

      respond_with authorized: @product.core_team.include?(@user)
    end

    def set_access_control_headers
      headers['Access-Control-Allow-Origin'] = '*'
      headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE'
      headers['Access-Control-Request-Method'] = '*'
      headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept'
    end
  end
end
