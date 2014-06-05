class ReadRaptorClient

  def unread_articles(distinct_id, tag=nil)
    tagged_unread_articles(distinct_id).select do |a|
      a[:tags].include?(tag.to_s)
    end
  end

  def undelivered_articles(distinct_id)
    tagged_unread_articles(distinct_id).select do |a|
      # articles we want to email about are ones where the main article is unread (:content)
      # and the email hasn't been read (:email)
      a[:tags].include?(nil) && a[:tags].include?('email')
    end
  end

  def tagged_unread_articles(distinct_id)
    body = get("/readers/#{distinct_id}")
    group_with_tags (body || []).map{|a| a['key']}
  end

  def group_with_tags(article_ids)
    grouped = {}
    article_ids.map do |article_id|
      type, id, tag = article_id.split('_')
      grouped[id] ||= { type: type, id: id }
      grouped[id][:tags] ||= []
      grouped[id][:tags] << tag
    end
    grouped.values
  end

  def post(url, body = {})
    request :post, url, body
  end

  def get(url, body = {})
    request :get, url, body
  end

  def request(method, url, body)
    return unless ENV['READRAPTOR_URL']
    Rails.logger.info "  [readraptor] #{method} #{url}"

    resp = connection.send(method) do |req|
      req.url url
      req.body = body.to_json
    end

    JSON.load(resp.body) rescue nil
  end

  def connection
    Faraday.new(url: ENV['READRAPTOR_URL']) do |faraday|
      faraday.adapter  :net_http
      faraday.basic_auth(ENV['READRAPTOR_TOKEN'], '')
    end
  end
end
