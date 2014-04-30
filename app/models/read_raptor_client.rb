class ReadRaptorClient

  def unread_entities(distinct_id)
    body = get("/readers/#{distinct_id}")
    body.map{|a| a['key'] }
  end

  def post(url, body = {})
    request :post, url, body
  end

  def get(url, body = {})
    request :get, url, body
  end

  def request(method, url, body)
    resp = connection.send(method) do |req|
      req.url url
      req.body = body.to_json
    end

    JSON.load(resp.body) rescue nil
  end

  def connection
    raise 'You need to configure READRAPTOR_URL' if ENV['READRAPTOR_URL'].blank?
    Faraday.new(url: ENV['READRAPTOR_URL']) do |faraday|
      faraday.adapter  :net_http
      faraday.basic_auth(ENV['READRAPTOR_TOKEN'], '')
    end
  end
end
