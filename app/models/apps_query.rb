class AppsQuery
  FILTER_MINE = 'mine'
  FILTER_LIVE = 'live'
  FILTER_PUBLIC = 'public'

  ORDER_NEW = 'new'
  ORDER_TREND = 'trend'

  attr_reader :params

  def initialize(user = nil, params)
    @user = user
    @params = params.symbolize_keys
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
    when params[:filter] == FILTER_MINE
      Product.where(user: @user)
    when params[:filter] == FILTER_LIVE
      Product.public_products.live
    when params[:topic].present?
      Product.public_products.with_topic(params[:topic])
    when params[:showcase].present?
      Product.joins(:showcases).where(showcases: {slug: params[:showcase]})
    else
      Product.public_products
    end
  end

  def sort_order
    case params[:filter]
    when ORDER_NEW
      Product.order(created_at: :desc)
    else
      when_clauses = SevenDayMVP::PRODUCTS.each_with_index.map { |slug, i| "WHEN products.slug='#{slug}' THEN #{i}" }.join(' ')
      case_statement = "(CASE #{when_clauses} ELSE #{SevenDayMVP::PRODUCTS.size} END) ASC"

      Product.order(case_statement).
        ordered_by_trend
    end
  end
end
