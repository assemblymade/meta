namespace :leaderboard do
  task :rebuild => :environment do
    ::IdeaLeaderboard.new(Leaderboard.new($redis)).rebuild!
  end
end
