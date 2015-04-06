class HotBounty

  def self.get_hot_bounties(n)

  end

  def self.newest_bounties(n)
    Task.order("updated_at desc").limit(n)
  end

  def self.most_loved_authors(n, filterStaff)
    users = User.order("hearts_received desc")
    if filterStaff
      users.where(is_staff: false).limit(n)
    else
      users.limit(n)
    end
  end

  def self.filter_bounties_by_author_love(n, filterStaff)
    hot_authors = self.most_loved_authors(n, filterStaff)
    self.newest_bounties(10*n).where(user: hot_authors)
  end



end
