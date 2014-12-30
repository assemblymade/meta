class WipGroup
  # Groups wip entities into products => wips => comments. Useful for
  # contstructing newsletters from an array of Wips and Comments

  attr_reader :products, :watchers, :events_with_mentions

  def initialize(entities, include_mentions=[])
    @entities = entities

    @products = {}
    watchers = []
    @include_mentions = include_mentions
    @events_with_mentions = {}

    entities.each do |o|
      case o
      when Task, Discussion
        product = o.product
        @products[product] ||= {}
        @products[product][o.news_feed_item] ||= []
        watchers += o.follower_ids
      when NewsFeedItemComment
        product = o.product
        @products[product] ||= {}
        @products[product][o.news_feed_item] ||= []
        @products[product][o.news_feed_item] << o
        watchers += o.news_feed_item.follower_ids

        if mentioned_users = o.mentioned_users
          relevant_mentions = mentioned_users.map(&:username) & @include_mentions
          @events_with_mentions[o] = relevant_mentions if relevant_mentions.any?
        end
      end
    end

    @watchers = User.find(watchers.uniq)
  end

  def count
    @entities.count
  end

  def product_names
    products.keys.map(&:name)
  end
end
