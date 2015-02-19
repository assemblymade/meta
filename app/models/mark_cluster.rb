class MarkCluster < ActiveRecord::Base
  has_many :marks

  LEADER_TIMESPAN = 7.days

  def assign_mark(mark_name)
    m = Mark.find_by(name: mark_name)
    if m
      m.assign_cluster(self)
    end
  end

  def top_users(n, filter_staff)
    threshold_date = DateTime.now - LEADER_TIMESPAN
    markings = Marking.where('updated_at > ?', threshold_date)
    .where(mark_id: self.marks.map(&:id))
    .where(markable_type: "UserIdentity")

    markings = Marking.where(markable_type: "UserIdentity").group(:markable_id).select("markable_id, SUM(weight) as weight_sum")
    .order("weight_sum desc").where.not(weight: "NaN").limit(10)
    .map { |a| [a['markable_id'], a['weight_sum']] }

    r = markings.map{|k,v| [UserIdentity.find_by(id: k).user.username, v]}

    if filter_staff
      r = r.select{|a, b| !User.find_by(username: a).is_staff}
    end
    r.sort_by{|a,b| -b}
  end


end
