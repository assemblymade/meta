class HotBounty

  def self.get_hot_bounties(n, filterStaff)
    hot_authors = self.most_loved_authors(n, filterStaff)
    self.newest_bounties(10*n).where(user: hot_authors)
  end

  def self.newest_bounties(n)
    Task.order("updated_at desc").limit(n)
  end

  def most_loved_authors(n)
    users = User.order("hearts_received desc")
    users.where(is_staff: false).limit(n)
  end

  def find_best_task_from_user(user, time_since)
    Wip.where(user_id: user.id).
      where(state: "open").
      where('created_at > ?', time_since).
      order("created_at desc").
      limit(1)
  end

  def sort_best_bounties(n, since_time)
    top_users = most_loved_authors(n)
    w = []
    top_users.each do |a|
      newwips = find_best_task_from_user(a, since_time).to_a.first
      if newwips
        w.append(newwips)
      end
    end
    w
  end

end
