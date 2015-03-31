class ChatMigrator < OpenAssets::Remote
  def initialize
    @root_url = ENV["LANDLINE_URL"]
  end

  def request(method, url, body)
    resp = connection.send(method) do |req|
      auth_hash = Base64.encode64("#{ENV['LANDLINE_SECRET']}:")
      req.url url
      req.headers['Authorization'] = "Basic #{auth_hash}"
      req.body = body
    end

    resp.body
  end
end
