class LeaderboardProgressbar

  attr_reader :leaderboard

  def initialize(leaderboard)
    @leaderboard = leaderboard
  end

  def each
    leaderboard.range(0, -1).each do |product|
      yield(product.id, leaderboard.score_for(product))
    end
  end

end
