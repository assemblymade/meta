class PaymentsWorker
  include Sidekiq::Worker

  def perform(method, url, token, body = {})
    self.send(method, url, token, body)
  end

  private

  def delete(url, token, body = {})
    request :delete, url, token
  end

  def post(url, token, body = {})
    request :post, url, token, body
  end

  def request(method, url, token, body = {})
    resp = connection.send(method) do |req|
      req.url url
      req.headers['Authorization'] = "#{token}"
      req.headers['Content-Type'] = 'application/json'
      req.body = body.to_json
    end

    begin
      JSON.load(resp.body)
    rescue => e
      ''
    end
  end

  def connection
    Faraday.new(url: ENV["PAYMENTS_URL"]) do |faraday|
      faraday.adapter  :net_http
    end
  end
end
