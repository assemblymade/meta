class UserClusterAssignments

  def generate_clusters(n_clusters)
    UserCluster.delete_all
    total_users = User.count
    users_per_cluster = total_users / n_clusters  + 1 #round up
    n=0

    (0..n_clusters-1).each do |i|
      cluster = UserCluster.create!
      start_user = i*users_per_cluster
      end_user = (i+1)*users_per_cluster
      cluster.users = cluster.users + User.all[start_user, end_user]
      cluster.users.each do |u|
        puts n.to_s
        n=n+1
        u.update!({user_cluster_id: cluster.id})
      end

    end
  end


  def cluster_frack
    UserCluster.delete_all
    awwstners = UserCluster.create!
    User.find_by(username: "awwstn").update!({user_cluster_id: awwstners.id})
    awwstners.calculate_center
    awwstners.calculate_variance

    barisserians = UserCluster.create!
    User.find_by(username: "barisser").update!({user_cluster_id: barisserians.id})
    barisserians.calculate_center
    barisserians.calculate_variance

    qristians = UserCluster.create!
    User.find_by(username: "chrislloyd").update!({user_cluster_id: qristians.id})
    qristians.calculate_center
    qristians.calculate_variance

    benidictine = UserCluster.create!
    User.find_by(username: "bshyong").update!({user_cluster_id: benidictine.id})
    benidictine.calculate_center
    benidictine.calculate_variance

    maladeiters = UserCluster.create!
    User.find_by(username: "mdeiters").update!({user_cluster_id: maladeiters.id})
    maladeiters.calculate_center
    maladeiters.calculate_variance


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
