class PostChatMessage
  include Sidekiq::Worker

  def perform(product_slug, message)
    @product = Product.find_by(slug: product_slug)

    return false unless Activity.where(target_id: @product.id)
                          .where.not(type: 'Activities::Chat')
                          .where.not(type: 'Activities::FoundProduct')
                          .empty?

    @user = User.find_by(username: 'kernel')

    post Rails.application.routes.url_helpers.api_product_chat_comments_path(@product),
      body: message
  end

  private

  def post(url, payload = {})
    request :post, url, payload
  end

  def request(method, url, body = {})
    resp = connection.send(method) do |req|
      req.url url
      req.headers['Authorization'] = "Token token=#{@user.authentication_token}"
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
