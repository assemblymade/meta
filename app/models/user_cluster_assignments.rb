class UserClusterAssignments

  def generate_clusters(n_clusters)
    UserCluster.delete_all
    total_users = User.count
    users_per_cluster = total_users / n_clusters  + 1 #round up

    (0..n_clusters-1).each do |i|
      cluster = UserCluster.create!
      start_user = i*users_per_cluster
      end_user = (i+1)*users_per_cluster
      cluster.users = cluster.users + User.all[start_user, end_user]
      cluster.calculate_center
    end
  end

  def switch_one_user(user)
    best_cluster = user.best_cluster
    if best_cluster != user.cluster
      best_cluster.add_user(user)
      user.cluster.remove_user(user)
    end
  end

  def total_cluster_variance
    UserCluster.all.sum(:variance)
  end

end
