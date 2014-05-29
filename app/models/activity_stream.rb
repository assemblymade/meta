class ActivityStream
  include Enumerable

  KEY_PREFIX = 'activitystream'
  DEFAULT_PAGE_LENGTH = 25

  def self.serialize(activity)
    activity.id.to_s
  end

  def self.deserialize(*strs)
    Activity.find(strs)
  end

  def self.delete_all
    keys = $redis.keys("#{KEY_PREFIX}:*")
    $redis.del(*keys)
  end

  def initialize(object)
    @object = object
  end

  def each
    values.each { |v| yield(v) }
  end

  def push(activity)
    $redis.zadd(
      key,
      activity.created_at.to_i,
      self.class.serialize(activity)
    )
    activity
  end

  def values
    range(0, -1)
  end

  def range(start_index, end_index)
    ids = $redis.zrevrange(key, start_index, end_index)
    if ids.present?
      self.class.deserialize(ids).sort_by(&:created_at)
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
    [KEY_PREFIX, @object.class.name.underscore, @object.id].join(':')
  end

end
