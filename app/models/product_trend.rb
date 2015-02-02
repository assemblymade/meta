class ProductTrend < ActiveRecord::Base
  KEY_PREFIX = 'activitystream'

  belongs_to :product

  def set_score!
    self.score = trend_score
    self.save!
  end

  def trend_score(time_ago=2.weeks.ago)
    product.activities.where('created_at > ?', time_ago).count
  end
end
