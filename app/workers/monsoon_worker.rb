class MonsoonWorker
  include Sidekiq::Worker

  def perform(provider, integration_id)
    send(provider.to_sym, integration_id)
  end

  def google(integration_id)
    integration = Integration.find(integration_id)
    product = integration.product
    data = {
      product: product.id,
      endpoint:  Rails.application.routes.url_helpers.api_product_updates_url(product),
      access_token: integration.access_token,
      refresh_token: integration.refresh_token,
      token_type: integration.token_type,
      account_name: integration.config['account_name'],
      property_name: integration.config['property_name'],
      profile_name: integration.config['profile_name']
    }

    post "/products/#{product.id}/subscribers?token=#{product.authentication_token}", data
  end

  private

  def post(url, payload = {})
    request :post, url, payload
  end

  def request(method, url, body = {})
    resp = connection.send(method) do |req|
      req.url url
      req.headers['Content-Type'] = 'application/json'
      req.body = body.to_json
    end

    JSON.load(resp.body)
  end

  def connection
    Faraday.new(url: ENV['MONSOON_URL']) do |faraday|
      faraday.adapter  :net_http
    end
  end
end
