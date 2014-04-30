module LeaderboardHelper

  def format_leaderboard_rank(rank)
    "##{rank + 1}"
  end

  def days_until_time(time)
    (time.to_date - Date.today).to_i
  end

end
