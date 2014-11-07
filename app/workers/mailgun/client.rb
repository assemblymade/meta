module Mailgun
  class Client
    def get(url)
      request(:get, url)
    end

    def post(url, body)
      request(:post, url, body)
    end

    def request(method, url, body=nil)
      resp = connection.send(method) do |req|
        req.url File.join(base_url, url)
        req.body = body
      end

      log = ['MAILGUN', method, url, body.inspect, "[#{resp.status}]"]
      if !resp.success?
        log << resp.body.inspect
      end
      Rails.logger.info log.join(' ')

      data = JSON.load(resp.body) rescue nil

      [data || resp.body, resp.status]
    end

    def connection
      Faraday.new do |faraday|
        faraday.request  :url_encoded
        faraday.adapter  Faraday.default_adapter
        faraday.basic_auth('api', ENV['MAILGUN_API_KEY'])
      end
    end

    # private

    def base_url
      ENV['MAILGUN_URL'] || 'https://api.mailgun.net/v2'
    end
  end
end
