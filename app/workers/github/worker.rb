module Github
  class Worker
    include Sidekiq::Worker

    def add_webhooks(repo)
      post "/repos/#{repo}/hooks",
        name: "web",
        active: "true",
        events: %w(push pull_request pull_request_review_comment issue_comment),
        config: {
          url: 'https://assembly.com/webhooks/github',
          content_type: 'json'
        }
    end
    
    def commit_count(repo)
      stats("#{repo}").first['total']
    end
    
    def stats(repo)
      get "/repos/#{repo}/stats/contributors"
    end

    def get(url, body = {})
      request :get, url, body
    end

    def put(url, body = {})
      request :put, url, body
    end

    def post(url, body = {})
      request :post, url, body
    end

    def request(method, url, body)
      resp = connection.send(method) do |req|
        req.url url
        req.headers['Authorization'] = "token #{ENV['GITHUB_USER_TOKEN']}"
        req.body = body.to_json
      end

      JSON.load(resp.body)
    end

    def connection
      Faraday.new(url: 'https://api.github.com') do |faraday|
        faraday.adapter  :net_http
      end
    end
  end
end
