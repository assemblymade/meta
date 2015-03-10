class MixpanelClient
  def request(url, options={})
    query = build_request_query(options)

    resp = connection.get do |req|
      req.url "/api/2.0/#{url}?#{query}"
    end

    JSON.load(resp.body)
  end

  def connection
    Faraday.new(url: 'http://mixpanel.com') do |faraday|
      faraday.adapter  :net_http
    end
  end

  def build_request_query(options = {})
    options.merge!(api_key: ENV['MIXPANEL_API_KEY'], expire: expire)
    options = options.keys.sort.map {|k| "#{k}=#{options[k]}" }
    sig = Digest::MD5.hexdigest(options.join + ENV['MIXPANEL_API_SECRET'])
    options << "sig=#{sig}"
    puts "mixpanel:#{options}"
    options.join("&")
  end

  def expire
    (10.minutes.from_now).to_i
  end
end
