class Tweeter

  def idea_participants(idea)
    if idea.user.twitter_nickname
      [idea.user.twitter_nickname, "asm"]
    else
      ["asm"]
    end
  end

  def idea_marks(idea)
    ["ideas"]
  end

  def compute_password
    a = Time.now.to_i.to_s
    code = ENV['TWEETER_PASSWORD'].to_s + a
    encoded = Digest::SHA256.new.hexdigest(code)
    encoded
  end

  def tweet_idea(idea)
    password = compute_password
    url = "https://asm-tweeter.herokuapp.com/idea/" + password
    the_data = {
      idea_name: idea.twitter_title,
      users: idea_participants(idea),
      url: IdeaSerializer.new(idea).url,
      hashtags: idea_marks(idea)
    }

    idea.update!({last_tweeted_at: Time.now()})

    request :post, url, the_data
  end

  def request(method, url, body = {})
    resp = connection.send(method) do |req|
      req.url url
      req.headers['Content-Type'] = 'application/json'
      req.body = body.to_json
    end

    begin
      JSON.load(resp.body)
    rescue => e
      Rails.logger.info "[twitter_bot] #{e.message}"
    end
  end

  def connection
    Faraday.new do |faraday|
      faraday.adapter  :net_http
    end
  end

end
