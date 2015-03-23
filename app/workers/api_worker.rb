class ApiWorker
  include Sidekiq::Worker
  include Rails.application.routes.url_helpers

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
