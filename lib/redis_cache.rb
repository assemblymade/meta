class RedisCache
  def self.bool(key, field, &blk)
    result = $redis.hget(key, field)
    if result.nil?
      result = blk.call ? 1 : 0
      $redis.hset(key, field, result)
    end
    result.to_i == 1
  end
  
  def self.clear(key, field)
    $redis.hdel key, field
  end
end