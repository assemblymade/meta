# update counts get stored in a redis hash
# a value of 0 indicates an unread WIP
# values > 0 indicate unread comments

class Wip::Updates
  def initialize(wip)
    @wip = wip
  end

  def for(user)
    Wip::Updates::ForUser.new(@wip, user)
  end
end

class Wip::Updates::ForUser
  def initialize(wip, user)
    @wip = wip
    @user = user
    @new_key = !$redis.exists(update_key)
  end

  def new_wip!
    $redis.hset update_key, @wip.id, 0

    expire_keys! if @new_key
  end

  def unread?
    $redis.hget(update_key, @wip.id) == '0'
  end

  def new_comment!
    if !unread?
      $redis.hincrby update_key, @wip.id, 1
      expire_keys! if @new_key
    end
  end

  def unread_comment_count
    $redis.hget(update_key, @wip.id).try(:to_i)
  end

  def viewed!
    $redis.hdel update_key, @wip.id
    expire_keys!
  end

  private

  def expire_keys!
    # expire keys in 2 weeks
    $redis.expire update_key, 2.weeks.to_i
  end

  def update_key
    "user:#{@user.id}:wip-updates"
  end
end
