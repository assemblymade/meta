class Tweeter

  def idea_participants(idea)
    if idea.user.twitter_nickname
      [idea.user.twitter_nickname, "asm"]
    else
      ["asm"]
    end
  end

  def self.tweet_new_product(idea, product)
    mention = product.user.twitter_nickname
    if !mention
      mention = " "
    else
      mention = " @"+mention+" "
    end
    tweet_text = "The idea #{idea.name} just became a product called #{product.name}#{mention}#{ProductSerializer.new(product).full_url}"
    TweetWorker.perform_async(tweet_text)
  end

  def product_participants(product)
    if product.user.twitter_nickname
      participants = [product.user.twitter_nickname]
    else
      participants = ["asm"]
    end

    TransactionLogEntry.product_partners(product.id).order('sum(cents) desc').take(15).sample(3)
  end

  def idea_marks(idea)
    ["ideas"]
  end

  def compute_password
    a = Time.now.to_i.to_s
    code = ENV['TWEETER_PASSWORD'].to_s + a
    Digest::SHA256.new.hexdigest(code)
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

  def top_products_by_activity
    ProductStats.top_products_by_activity(limit: 12).select{|a, b| a != "meta"}.map{|a, b| Product.find_by(slug: a)}
  end

  def bounties_from_top_products
    top_products_by_activity.map{|a| a.tasks}.flatten.select{|a| a.state == "open"}
  end

  def worthy_bounties(n)
    bounty_suggestion_fraction = 0.5
    sorted_top_bountys = bounties_from_top_products.select{|a| a.earnable_coins_cache}.sort_by{|a| -a.earnable_coins_cache}
    top_bountys = sorted_top_bountys.take(top_bountys.count * bounty_suggestion_fraction)
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
    worthy_growth = top_growth.select{|a| a[1][0] > 10}
    worthy_growth.each do |a|
      tweet_hot_product(a[0], a[1][0])
    end
  end

  def tweet_hot_product(product_slug, growth)
    password = compute_password
    url = "https://asm-tweeter.herokuapp.com/product/hot/" + password
    name = Product.find_by(slug: product_slug).name
    the_data = {
      product_name: name,
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

  def construct_tweet_data_post(news_feed_item)
    if news_feed_item.target.user.twitter_nickname
      authors = [news_feed_item.target.user.twitter_nickname]
    else
      authors = []
    end

    data = {
      title: news_feed_item.target.title,
      authors: authors,
      link: PostSerializer.new(news_feed_item.target).full_url,
      hashtags: [],
      proceed: true
      }
  end

  def construct_tweet_data_idea(news_feed_item)
    data = {
      title: news_feed_item.target.name,
      authors: idea_participants(news_feed_item.target),
      url: IdeaSerializer.new(news_feed_item.target).url,
      hashtags: idea_marks(news_feed_item.target)
    }
  end

  def tweet_loved_news_feed_item(news_feed_item)
    password = compute_password
    url = "https://asm-tweeter.herokuapp.com/love/" + password
    participants = []
    proceed = false

    if news_feed_item.target_type == "Post"
      the_data = construct_tweet_data_post
      proceed=true
    elsif news_feed_item.target_type == "Idea"
      the_data = construct_tweet_data_idea
      proceed=true
    end

    if proceed
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
