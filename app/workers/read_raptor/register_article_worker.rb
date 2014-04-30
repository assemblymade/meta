module ReadRaptor
  class RegisterArticleWorker
    include Sidekiq::Worker

    def perform(args)
      post "/articles", args
    end

    def post(url, body = {})
      request :post, url, body
    end

    def request(method, url, body)
      resp = connection.send(method) do |req|
        req.url url
        req.body = body.to_json
      end

      Rails.logger.info "readraptor #{method} #{url}: #{body.to_json} > #{resp.status}"

      JSON.load(resp.body) rescue nil
    end

    def connection
      Faraday.new(url: ENV['READRAPTOR_URL']) do |faraday|
        faraday.adapter  :net_http
        faraday.basic_auth(ENV['READRAPTOR_TOKEN'], '')
      end
    end
  end
end