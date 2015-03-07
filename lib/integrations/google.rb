module Integrations
  class Google
    def initialize
      @remote = Integrations::Remote.new(ENV['GOOGLE_OAUTH_URL'])
    end

    def call(action, data)
      send(action, data)
    end

    def authorize(product)
      "#{ENV['GOOGLE_OAUTH_URL']}/o/oauth2/auth?#{authorize_options(product)}"
    end

    def token(code)
      @remote.post "/o/oauth2/token", token_options(code)
    end

    def authorize_options(product)
      {
        response_type: 'code',
        client_id: ENV['GOOGLE_CLIENT_ID'],
        redirect_uri: ENV['GOOGLE_REDIRECT_URI'],
        scope: 'https://www.googleapis.com/auth/analytics.readonly',
        state: product.authentication_token,
        access_type: 'offline',
        approval_prompt: 'force'
      }.to_query
    end

    def token_options(code)
      {
        code: code,
        client_id: ENV['GOOGLE_CLIENT_ID'],
        client_secret: ENV['GOOGLE_CLIENT_SECRET'],
        redirect_uri: ENV['GOOGLE_REDIRECT_URI'],
        grant_type: 'authorization_code'
      }.to_query
    end
  end
end
