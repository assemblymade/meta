class AppsQuery
  def initialize(user, filter)
    @user = user
    @filter = filter
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
    case @filter
    when 'mine'
      Product.where(user: @user)
    when 'live'
      Product.public_products.live
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
