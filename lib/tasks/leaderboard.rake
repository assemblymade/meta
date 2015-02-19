namespace :leaderboard do

  task :reset_positions_marks => :environment do
    sorted_ranks = LeaderDetermination.new.sorted_marks

    LeaderPosition.all.delete_all
    sorted_ranks.each do |k, v|
      n = 1
      v.each do |a|
        u = User.find_by(username: a[0])
        if u
          lp = LeaderPosition.create!({leader_type: k, rank: n, user: u})
        end
        n = n + 1
      end
    end
  end

  task :reset_positions_clusters => :environment do
    sorted_ranks = LeaderDetermination.new.all_cluster_ranks
    LeaderPosition.all.delete_all
    sorted_ranks.each do |k, v|
      n = 1
      v.each do |a|
        u = User.find_by(username: a[0])
        if u
          lp = LeaderPosition.create!({leader_type: k, rank: n, user: u})
        end
        n = n + 1
      end
    end
  end



end
