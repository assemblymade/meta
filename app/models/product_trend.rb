class ProductTrend < ActiveRecord::Base
  KEY_PREFIX = 'activitystream'

  belongs_to :product

  def set_score!
    self.score = trend_score
    self.save!
  end

  # TODO this shouldn't be tied to activity in a chat room, but we don't have an easy way of
  # getting activities associated with a product
  def trend_score(time_ago=2.weeks.ago)
    if room = product.chat_rooms.first
      key = [KEY_PREFIX, 'chat_room', room.id].join(':')
      ids = $redis.zrangebyscore(key, time_ago.to_i, (Time.now - 1).to_i)

      Activity.where(id: ids).count
    else
      0
    end
  end
end
