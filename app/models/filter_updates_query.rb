class FilterUpdatesQuery
  attr_accessor :updates, :options

  def self.call(updates, options={})
    new(updates, options).filter
  end

  def initialize(updates, options)
    self.updates = updates
    self.options = options
  end

  def clauses
    [archived, with_mark, with_target_type].compact
  end

  def filter
    clauses.inject(updates.where.not(last_commented_at: nil).includes(:target)) do |query, clause|
      query.merge(clause)
    end
  end

  def archived
    if options[:archived]
      NewsFeedItem.archived_items
    else
      NewsFeedItem.unarchived_items
    end
  end

  def with_mark
    return unless mark = options[:mark]

    NewsFeedItem.with_mark(mark)
  end

  def with_target_type
    return unless type = options[:type]

    NewsFeedItem.with_target_type(type.camelize)
  end
end
