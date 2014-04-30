class TimedSet
  def initialize(redis, key)
    @redis = redis
    @key = key
  end

  def add(val)
    @redis.zadd(@key, Time.now.to_i, val)
  end

  def drop_older_than(seconds)
    @redis.zremrangebyscore(@key, Time.now.to_i + seconds, 'inf')
  end

  def members
    @redis.zrange(@key, 0, -1)
  end
end
