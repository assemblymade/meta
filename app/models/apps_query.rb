class AppsQuery
  def initialize(user, filter, topic)
    @user = user
    @filter = filter
    @topic = topic
  end

  def perform
    clauses.inject(Product.all) do |query, clause|
      query.merge(clause)
    end
  end

  def clauses
    [filter_clause, sort_order].compact
  end

  def filter_clause
    case
    when @filter == 'mine'
      Product.where(user: @user)
    when @filter == 'live'
      Product.public_products.live
    when @topic.present?
      Product.public_products.with_mark(@topic)
    else
      Product.public_products
    end
  end

  def sort_order
    case @filter
    when 'new'
      Product.order(created_at: :desc)
    else
      Product.ordered_by_trend
    end
  end
end
