class IntegrationsController < ProductController
  respond_to :json

  def authorize
    authenticate_user!
    find_product!

    redirect_to integration.new.call(:authorize, @product)
  end

  def token
    @product = Product.find_by!(authentication_token: params[:state])

    if params[:error]
      flash[:oauth_error] = "There was an error connecting the #{provider} integration"
    else
      tokens = integration.new.call(:token, params[:code])
      
      @integration = Integration.create!(
        product: @product,
        access_token: tokens['access_token'],
        refresh_token: tokens['refresh_token'],
        token_type: tokens['token_type'],
        provider: params[:provider]
      )
    end

    redirect_to product_resources_path(@product)
  end

  def integration
    "Integrations::#{provider}".constantize
  end

  def provider
    params[:provider].capitalize
  end
end
