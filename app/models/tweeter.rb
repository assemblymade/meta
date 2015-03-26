class Tweeter

  def idea_participants(idea)
    if idea.user.twitter_nickname
      [idea.user.twitter_nickname, "asm"]
    else
      ["asm"]
    end
  end

  def product_participants(product)
    participants = []
    if product.user.twitter_nickname
      participants = participants + [product.user.twitter_nickname]
    else
      participants = participants + ["asm"]
    end

    n = 3
    random_owners =
    TransactionLogEntry.where(
      product: product)
      .with_cents.group(:wallet_id).sum(:cents)
      .sort_by{|a, b| -b}
      .take(15).map{|a, b| User.find_by(id: a)}
      .select{|a| a}.map{|a| a.twitter_nickname}.select{|a| a}.sample(n)

    participants = participants + random_owners
    participants.uniq
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

  def bounty_participants(bounty)
    participants = []
    if bounty.user.twitter_nickname
      participants.append(bounty.user.twitter_nickname)
    end
    participants = participants + product_participants(bounty.product)
    participants.uniq.take(3)
  end

  def bounty_hashtags(bounty)
    QueryMarks.new.legible_mark_vector(bounty.mark_vector).sort_by{|a, b| -b}.map{|a, b| a}.take(4)
  end

  def worthy_bounties(n)
    bounty_suggestion_fraction = 0.5
    top_products = ProductStats.top_products_by_activity(limit: 12).select{|a, b| a != "meta"}.map{|a, b| Product.find_by(slug: a)}
    top_bountys = top_products.map{|a| a.tasks}.flatten.select{|a| a.state == "open"}
    top_bountys = top_bountys.select{|a| a.earnable_coins_cache}.sort_by{|a| -a.earnable_coins_cache}
    top_bountys = top_bountys.take(top_bountys.count * bounty_suggestion_fraction)
    top_bountys.sample(n).uniq
  end

  def promote_bounty(bounty)
    password = compute_password
    url = "https://asm-tweeter.herokuapp.com/bounties/promote/" + password
    the_data = {
      bounty_name: bounty.title,
      authors: bounty_participants(bounty),
      url: WipSerializer.new(bounty).full_url,
      hashtags: bounty_hashtags(bounty),
      product_name: bounty.product.name
    }

    request :post, url, the_data
  end

  def promote_worthy_bounties(n)
    bounties = worthy_bounties(n)
    bounties.each do |b|
      promote_bounty(b)
    end
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

  def tweet_hot_products(top_n)
    top_growth = ProductStats.hottest_products.take(top_n)  #absolute growth not proportional
    top_growth.each do |a|
      growth = a[1][0]
      product = Product.find_by(slug: a[0])
      if growth > 10
        tweet_hot_product(product, growth)
      end
    end
  end

  def tweet_hot_product(product, growth)
    password = compute_password
    url = "https://asm-tweeter.herokuapp.com/product/hot/" + password
    the_data = {
      product_name: product.name,
      users: product_participants(product),
      url: ProductSerializer.new(product).full_url,
      growth: growth
    }

    request :post, url, the_data
  end

  def tweet_welcome_user(user)
    if user.twitter_nickname
      password = compute_password
      url = "https://asm-tweeter.herokuapp.com/friends/new_user/" + password

      suggested_link = 'https://www.assembly.com/discover'

      the_data = {
        friends: [user.twitter_nickname],
        link: suggested_link
      }

      request :post, url, the_data
    end
  end

  def tweet_general(text)
    password = compute_password
    url = "https://asm-tweeter.herokuapp.com/general/" + password
    the_data = {
      tweet_text: text
    }
    request :post, url, the_data
  end

  def tweet_love_idea(idea)
    password = compute_password
    url = "https://asm-tweeter.herokuapp.com/love/" + password
    participants = idea_participants(idea)
    the_data = {
      title: idea.name,
      authors: participants,
      url: IdeaSerializer.new(idea).url,
      hashtags: idea_marks(idea)
    }
    request :post, url, the_data
  end

  def tweet_loved_news_feed_items(top_n, time_period)
    most_loved = ProductStats.most_loved(top_n, time_period)
    most_loved.each do |a|
      tweet_loved_news_feed_item(a)
    end
  end

  def tweet_loved_news_feed_item(news_feed_item)
    password = compute_password
    url = "https://asm-tweeter.herokuapp.com/love/" + password
    participants = []
    proceed = false

    if news_feed_item.target_type == "Post"
      title = news_feed_item.target.title
      if news_feed_item.target.user.twitter_nickname
        participants.append(news_feed_item.target.user.twitter_nickname)
      end
      link = PostSerializer.new(news_feed_item.target).full_url
      hashtags = []
      proceed=true
    elsif news_feed_item.target_type == "Idea"
      idea = news_feed_item.target
      title = news_feed_item.target.name
      participants = idea_participants(idea)
      link = IdeaSerializer.new(idea).url
      hashtags = idea_marks(idea)
      proceed=true
    end

    if proceed
      the_data = {
        title: title,
        authors: participants,
        url: link,
        hashtags: hashtags
      }
      request :post, url, the_data
    end
  end

  def request(method, url, body = {})
    return if Rails.env.development? or Rails.env.test?

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
