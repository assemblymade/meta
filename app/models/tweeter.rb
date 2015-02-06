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
      .take(12).map{|a, b| User.find_by(id: a)}
      .select{|a| a}.map{|a| a.username}.sample(n)

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
