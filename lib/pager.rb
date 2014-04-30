class Pager

  def initialize(leaderboard, member)
    @leaderboard = leaderboard
    @member = member
  end

  def show?
    @leaderboard.size >= 2
  end

  def current_rank
    @leaderboard.rank_for(@member)
  end

  def higher?
    not current_rank.zero?
  end

  def higher_member
    @leaderboard.idea_at higher_rank
  end

  def higher_rank
    current_rank - 1
  end

  def lower?
    current_rank < (@leaderboard.size - 1)
  end

  def lower_member
    @leaderboard.idea_at lower_rank
  end

  def lower_rank
    current_rank + 1
  end

end
