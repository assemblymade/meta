module Github
  class Worker
    include Sidekiq::Worker

    def add_webhooks(repo)
      post "/repos/#{repo}/hooks",
        name: "web",
        active: "true",
        events: %w(push pull_request pull_request_review_comment issue_comment),
        config: {
          url: 'https://cove.assembly.com/webhooks/github',
          content_type: 'json'
        }
    end

    def render_erb(view, object)
      text = ERB.new(
        File.read(Rails.root.join(view))
      ).result(SimpleDelegator.new(object).binding)
    end

    def commit_count(repo)
      s = stats("#{repo}")

      return 0 if s.nil? || s.first.nil? || s.first.empty?

      begin
        s.first['total']
      rescue
        0
      end
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

    def launchpad_post(url, body = {})
      launchpad_request :post, url, body
    end

    def request(method, url, body)
      resp = connection.send(method) do |req|
        req.url url
        req.headers['Authorization'] = "token #{ENV['GITHUB_USER_TOKEN']}"
        req.body = body.to_json
      end

      log = ['  ', method, url, body.inspect, "[#{resp.status}]", "X-RateLimit-Remaining: #{resp.headers['X-RateLimit-Remaining']}"]
      if !resp.success?
        log << resp.body.inspect
      end
      Rails.logger.info log.join(' ')

      JSON.load(resp.body)
    end

    def launchpad_request(method, url, body)
      resp = launchpad_connection.send(method) do |req|
        req.url url
        # TODO: We can send the OAuth token for the user if we want to create
        #       the repo in his/her account.
        # req.headers['Authorization'] = "token github_oauth_token
        req.headers['Content-Type'] = 'application/json'
        req.body = body.to_json
      end

      JSON.load(resp.body)
    end

    def connection
      Faraday.new(url: 'https://api.github.com') do |faraday|
        faraday.adapter  :net_http
      end
    end

    def launchpad_connection
      # ENV['LAUNCHPAD_URL']
      Faraday.new(url: 'http://launchpad.assembly.com') do |faraday|
        faraday.adapter  :net_http
      end
    end
  end
end
