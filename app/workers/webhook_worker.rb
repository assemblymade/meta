class WebhookWorker
  include Sidekiq::Worker

  def post(url, payload = {})
    request :post, url, payload
  end

  def request(method, url, body = {})
    body = body.to_json

    resp = connection.send(method) do |req|
      req.url url
      req.headers['Content-Type'] = 'application/json'
      req.body = body
    end

    resp.body
  end

  def connection
    Faraday.new do |faraday|
      faraday.adapter  :net_http
    end
  end
end
