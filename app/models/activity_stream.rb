class ActivityStream
  include Enumerable

  def self.serialize(activity)
    activity.id.to_s
  end

  def self.deserialize(*strs)
    Activity.find(strs)
  end

  def initialize(object)
    @object = object
  end

  def each
    values.each { |v| yield(v) }
  end

  def push(activity)
    $redis.rpush(key, self.class.serialize(activity))
  end

  def values
    range(0, -1)
  end

  def range(start_index, end_index)
    ids = $redis.lrange(key, start_index, end_index)
    if ids.present?
      self.class.deserialize(ids)
    else
      []
    end
  end

  def last(n)
    range(-n, -1)
  end

# private

  def key
    ['activitystream', @object.class.name.underscore, @object.id].join(':')
  end

end
