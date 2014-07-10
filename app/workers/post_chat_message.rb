class PostChatMessage
  include Sidekiq::Worker

  def perform(product_id, message)
    @product = Product.find_by(slug: product_id)

    post Rails.application.routes.url_helpers.api_product_chat_comments_path(@product),
      body: message
  end

  def post(url, payload = {})
    request :post, url, payload
  end

  def request(method, url, body = {})
    resp = connection.send(method) do |req|
      req.url url
      req.headers['Authorization'] = "token #{ENV['KERNEL_CHAT_TOKEN']}"
      req.headers['Content-Type'] = 'application/json'
      req.body = body.to_json
    end

    JSON.load(resp.body)
  end

  def connection
    Faraday.new(url: Rails.application.routes.url_helpers.root_url) do |faraday|
      faraday.adapter  :net_http
    end
  end
end
