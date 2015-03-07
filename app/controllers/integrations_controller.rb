class IntegrationsController < ProductController
  respond_to :json

  before_action :authenticate_user!, except: [:token]
  before_action :validate_user!, only: [:update]

  def authorize
    find_product!

    redirect_to integration.new.call(:authorize, @product)
  end

  def token
    @product = Product.find_by!(authentication_token: params[:state])

    if params[:error]
      flash[:oauth_error] = "There was an error connecting the #{provider} integration"
    else
      tokens = integration.new.call(:token, params[:code])

      @integration = Integration.find_or_initialize_by(product: @product)
      @integration.update!(
        access_token: tokens['access_token'],
        refresh_token: tokens['refresh_token'],
        token_type: tokens['token_type'],
        provider: params[:provider]
      )
    end

    redirect_to product_resources_path(@product)
  end

  def update
    validate_user!
    find_product!

    i = Integration.find_by!(product: @product, provider: params[:provider])
    i.update(config: integration_params[:config])

    MonsoonWorker.perform_async(params[:provider], i.id)

    redirect_to product_resources_path(@product)
  end

  def validate_user!
    head(:forbidden) unless can? :update, @wip
  end

  def integration
    "Integrations::#{provider}".constantize
  end

  def integration_params
    params.require(:integration)
  end

  def provider
    params[:provider].capitalize
  end
end
