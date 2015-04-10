class TweetPrep
  def self.bounty_hashtags(bounty)
    QueryMarks.new.legible_mark_vector(bounty.mark_vector).sort_by{|_, b| -b}.map{|a, _| a}.take(4)
  end

  def self.worthy_bounties(n)
    bounty_suggestion_fraction = 0.5
    sorted_top_bountys = bounties_from_top_products.select(&:earnable_coins_cache).sort_by{|a| -a.earnable_coins_cache}
    top_bountys = sorted_top_bountys.take(top_bountys.count * bounty_suggestion_fraction)
    top_bountys.sample(n).uniq
  end

  def self.bounties_from_top_products
    top_products_by_activity.map(&:tasks).flatten.select{|a| a.state == "open"}
  end

  def top_products_by_activity
    ProductStats.top_products_by_activity(limit: 12).select{|a, b| a != "meta"}.map{|a, b| Product.find_by(slug: a)}
  end

  def self.idea_participants(idea)
    if idea.user.twitter_nickname
      [idea.user.twitter_nickname, "asm"]
    else
      ["asm"]
    end
  end
end
