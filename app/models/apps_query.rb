class AppsQuery
  FILTER_MINE = 'mine'
  FILTER_LIVE = 'live'
  FILTER_PUBLIC = 'public'

  ORDER_NEW = 'new'
  ORDER_TREND = 'trend'

  def initialize(user = nil, filter = nil, topic = nil)
    @user = user
    @filter = filter
    @topic = topic
  end

  def perform
    clauses.inject(Product.includes(logo: :attachment)) do |query, clause|
      query.merge(clause)
    end
  end

  def clauses
    [filter_clause, sort_order].compact
  end

  def filter_clause
    case
    when @filter == FILTER_MINE
      Product.where(user: @user)
    when @filter == FILTER_LIVE
      Product.public_products.live
    when @topic.present?
      Product.public_products.with_mark(@topic)
    else
      Product.public_products
    end
  end

  def sort_order
    case @filter
    when ORDER_NEW
      Product.order(created_at: :desc)
    else
      Product.ordered_by_trend
    end
  end
end
