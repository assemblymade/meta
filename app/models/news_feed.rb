# This is a straight up copy of ActivityStream for Story objects
class NewsFeed
  include Enumerable

  KEY_PREFIX = 'news'
  DEFAULT_PAGE_LENGTH = 20

  def self.serialize(story)
    story.id.to_s
  end

  def self.deserialize(*strs)
    Story.where(id: strs).includes(:actors, :subject)
  end

  def self.delete_all
    keys = $redis.keys("#{KEY_PREFIX}:*")
    $redis.del(*keys) if keys.any?
  end

  # you can initialize with the model if loaded, or just the id
  # if you're optimising for perf/memory usage
  def initialize(klass_or_model, id=nil)
    if id.nil?
      @klass = klass_or_model.class
      @id = klass_or_model.id
    else
      @klass = klass_or_model
      @id = id
    end
  end

  def each
    values.each { |v| yield(v) }
  end

  def push(story)
    redis_push(story)
    story
  end

  def redis_push(story)
    $redis.zadd(
      key,
      story.created_at.to_i,
      self.class.serialize(story)
    )
  end

  def values
    range(0, -1)
  end

  def range(start_index, end_index)
    ids = $redis.zrevrange(key, start_index, end_index)
    if ids.present?
      self.class.deserialize(ids).sort_by(&:created_at).reverse
    else
      []
    end
  end

  def page(last_id=nil, limit = DEFAULT_PAGE_LENGTH)
    offset = if last_id.nil?
      0
    else
      $redis.zrevrank(key, last_id) + 1
    end
    range(offset, offset + limit - 1)
  end

# private

  def key
    [KEY_PREFIX, @klass.name.underscore, @id].join(':')
  end
end
