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

    def add_license_and_readme(product, repo_name)
      return if commit_count("#{ENV['GITHUB_PRODUCTS_ORG']}/#{repo_name}") > 0

      url = "https://#{ENV['GITHUB_PRODUCTS_GITHUB_USER']}:#{ENV['GITHUB_PRODUCTS_GITHUB_TOKEN']}@github.com/asm-products/#{repo_name}.git"
      Dir.mktmpdir do |dir|
        Dir.chdir(dir) do
          g = Git.init(repo_name)

          g.config('user.name', ENV['GITHUB_PRODUCTS_USER_NAME'])
          g.config('user.email', ENV['GITHUB_PRODUCTS_USER_EMAIL'])
          g.config('github.user', ENV['GITHUB_PRODUCTS_GITHUB_USER'])
          g.config('github.token', ENV['GITHUB_PRODUCTS_GITHUB_TOKEN'])

          Dir.chdir(repo_name) do
            write_erb_file 'README.md', 'app/views/products/git/readme.markdown.erb', product
            write_erb_file 'LICENSE', 'app/views/products/git/license.text.erb', product

            g.add(:all=>true)
            g.commit('Initial commit')
            g.add_remote 'origin', url
            g.push
          end
        end
      end
    end

    def write_erb_file(file, view, object)
      text = ERB.new(
        File.read(Rails.root.join(view))
      ).result(SimpleDelegator.new(object).binding)
      File.write(file, text)
    end

    def commit_count(repo)
      s = stats("#{repo}")
      return 0 if s.nil? || s.first.nil?

      s.first['total'] unless s.first.empty?
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
      Faraday.new(url: ENV['LAUNCHPAD_URL']) do |faraday|
        faraday.adapter  :net_http
      end
    end
  end
end
