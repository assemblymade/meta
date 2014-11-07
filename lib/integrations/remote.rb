module Integrations
  class Remote
    require 'faraday'

    def initialize(root_url)
      @root_url = root_url
    end

    def get(url)
      request :get, url
    end

    def post(url, body={})
      request :post, url, body
    end

    def request(method, url, body={})
      resp = connection.send(method) do |req|
        req.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        req.url url
        req.body = body
      end
      resp.body
    end

    def connection
      Faraday.new(url: @root_url) do |faraday|
        faraday.request :url_encoded
        faraday.response :logger
        faraday.response :json, :content_type => /\bjson$/

        faraday.adapter :net_http
      end
    end
  end
end
