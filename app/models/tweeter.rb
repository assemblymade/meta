class Tweeter

  def get_idea_participants(idea)
    if idea.user.twitter_nickname
      [idea.user.twitter_nickname, "asm"]
    else
      ["asm"]
    end
  end

  def get_idea_marks(idea)
    # text = idea.body
    # mark_vector = Interpreter.new.mark_vector_from_text(text)
    # mark_vector = QueryMarks.new.legible_mark_vector(mark_vector).sort_by{|a, b| -b}
    #
    # top_marks = [mark_vector.first[0], mark_vector.second[0]]

    ["ideas"]

  end

  def compute_password
    a = Time.now.to_i.to_s
    code = ENV['TWEETER_PASSWORD'].to_s + a
    puts code
    encoded = Digest::SHA256.new.hexdigest(code)
    puts encoded
    encoded
  end

  def tweet_idea(idea)
    password = compute_password()
    url = "https://asm-tweeter.herokuapp.com/idea/"+password
    the_data = {}
    the_data['idea_name'] = idea.twitter_title
    the_data['users'] = get_idea_participants(idea)
    the_data['url'] = IdeaSerializer.new(idea).url
    the_data['hashtags'] = get_idea_marks(idea)
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
      Rails.logger.info "[coins] #{e.message}"
    end
  end

  def connection
    Faraday.new(url: ENV.fetch("ASSEMBLY_COINS_URL")) do |faraday|
      faraday.adapter  :net_http
    end
  end

end
