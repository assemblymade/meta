class ProductTrend < ActiveRecord::Base
  KEY_PREFIX = 'activitystream'

  belongs_to :product

  def set_score!
    self.score = trend_score
    self.save!
  end

  def trend_score(time_ago=2.weeks.ago)
    key = [KEY_PREFIX, product.class.name.underscore, product.id].join(':')
    ids = $redis.zrangebyscore(key, time_ago.to_i, (Time.now - 1).to_i)

    Activity.where(id: ids).count
  end
end
