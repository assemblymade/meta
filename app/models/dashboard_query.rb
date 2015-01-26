require 'ostruct'

class DashboardQuery
  attr_accessor :user, :filter, :page

  def self.call(user, filter, page = 1)
    new(user, filter).find_dashboard
  end

  def initialize(user, filter, page = 1)
    self.user = user
    self.filter = filter
    self.page = page
  end

  def find_news_feed_items
    products = find_products

    @news_feed_items ||= NewsFeedItem.
      where(product_id: products.pluck(:id)).
      where(target_type: 'Wip').
      includes(:source, :hearts, last_comment: [:user, :hearts], target_task: [:tags, :product]).
      for_feed.
      page(page)
  end

  def find_user_locked_bounties
    user.locked_wips
  end

  def find_user_reviewing_bounties
    reviewing_products = user.core_products

    Task.joins(:product).
      merge(reviewing_products).
      where(state: 'reviewing')
  end

  def find_heartables
    news_feed_items = find_news_feed_items

    @heartables ||= news_feed_items + news_feed_items.flat_map(&:last_comment).compact
  end

  def find_user_hearts
    heartables = find_heartables

    user.hearts.where(heartable_id: heartables.map(&:id))
  end

  def find_products
    case filter
    when 'all'
      Product.public_products
    when 'following'
      user.followed_products
    when 'interests'
      product_ids = user.top_products.pluck(:product_id)
      Product.where(id: product_ids)
    else
      Product.where(slug: filter)
    end
  end

  def find_followed_products
    user.followed_products.ordered_by_trend
  end
end
