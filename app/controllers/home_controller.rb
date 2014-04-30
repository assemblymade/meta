class HomeController < ApplicationController

  def show
    leaderboard = ::IdeaLeaderboard.new(Leaderboard.new($redis))
    @ideas = leaderboard.top(3)
    @helpful = Product.where(slug: 'helpful').first!
  end

end
