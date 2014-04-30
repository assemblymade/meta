class Leaderboard

  TIE_BUSTER = 10000000000

  def initialize(redis, key='leaderboard')
    @redis = redis
    @key = key
  end

  def add(member, score)
    bloated = score * TIE_BUSTER + @redis.incr("#{@key}:counter")
    @redis.zadd(@key, bloated, member)
  end

  def remove(member)
    @redis.zrem(@key, member)
  end

  def size
    @redis.zcard(@key)
  end

  def rank_for(member)
    if score = @redis.zscore(@key, member)
      @redis.zcount(@key, "(#{score}", '+inf')
    end
  end

  def score_for(member)
    score = @redis.zscore(@key, member)
    if score
      score.to_i / TIE_BUSTER
    end
  end

  def score_at(rank)
    members = members_at(rank)
    if members.any?
      members.first[1].to_i
    end
  end

  def members_at(pos)
    range(pos, pos)
  end

  def range(start, fin)
    @redis.zrevrange(@key, start, fin, with_scores: true).map do |member, score|
      [member, score.to_i / TIE_BUSTER]
    end
  end

  def top(n)
    range(0, n - 1)
  end

  def clear
    @redis.del(@key)
  end

end
