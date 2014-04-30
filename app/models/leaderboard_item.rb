class LeaderboardItem
  include ActiveModel::SerializerSupport

  attr_reader :item
  attr_reader :value

  def initialize(leaderboard, item, value)
    @leaderboard = leaderboard
    @item = item
    @value = value
  end

  # TODO Convenience for HAML view
  alias_method :user, :item

  def rank
    @leaderboard.rank_for(self)
  end

  def percent
    (@value / @leaderboard.sum_values.to_f) * 100
  end

end

