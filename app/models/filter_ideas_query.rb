class FilterIdeasQuery
  attr_accessor :options

  def self.call(options={})
    new(options).filter
  end

  def initialize(options)
    self.options = options
  end

  def clauses
    [without_product, by_user, filter_by, sort_by, with_mark, with_topic, without_flag].compact
  end

  def filter
    filter_and_sort(Idea.includes(:news_feed_item))
  end

  def filter_and_sort(query)
    clauses.inject(query) do |query, clause|
      query.merge(clause)
    end
  end

  def by_user
    return unless options[:user]

    Idea.by(User.find_by(username: options[:user])).unscope(where: :product_id)
  end

  def filter_by
    if options[:filter]
      Idea.send(options[:filter].to_sym)
    else
      Idea.where(greenlit_at: nil)
    end
  end

  def sort_by
    case options[:sort]
    when 'newness'
      Idea.newness
    when 'hearts'
      Idea.hearts
    else
      Idea.trending
    end
  end

  def with_mark
    return unless options[:mark]

    Idea.with_mark(options[:mark])
  end

  def with_topic
    return unless options[:topic]

    Idea.with_topic(options[:topic])
  end

  def without_product
    Idea.where(product_id: nil)
  end

  def without_flag
    Idea.where(flagged_at: nil)
  end
end
