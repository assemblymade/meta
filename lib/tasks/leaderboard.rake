namespace :leaderboard do

  task :reset_positions => :environment do
    ActiveRecord::Base.logger = nil
    sorted_ranks = LeaderDetermination.new.sorted_marks

    LeaderPosition.all.delete_all
    sorted_ranks.each do |k, v|
      n = 1
      v.each do |a|
        u = User.find_by(username: a[0])
        if u
          lp = LeaderPosition.create!({leader_type: k, rank: n, user: u})
          puts "confirmed #{a[0]}"
        else
          puts a[0]
          puts "FAILED"
        end
        n = n + 1
      end
    end

  end
end
