module Dnsimple
  module Client
    def post(url, body)
      request(:post, url, body)
    end

    def request(method, url, body)
      resp = connection.send(method) do |req|
        req.url File.join(base_url, url)

        req.headers['X-DNSimple-Token'] = auth_token
        req.headers['Accept'] = 'application/json'
        req.headers['Content-Type'] = 'application/json'
        req.body = body.to_json
      end

      log = ['DNSIMPLE', method, url, body.inspect, "[#{resp.status}]"]
      if !resp.success?
        log << resp.body.inspect
      end
      Rails.logger.info log.join(' ')

      data = JSON.load(resp.body) rescue nil

      [data || resp.body, resp.status]
    end

    def connection
      Faraday.new do |faraday|
        faraday.adapter  :net_http
      end
    end

    # private

    def base_url
      ENV['DNSIMPLE_URL'] || 'https://api.dnsimple.com/v1'
    end

    def auth_token
      ENV['DNSIMPLE_AUTH'] || 'test'
    end
  end
end
