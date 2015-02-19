class MarkCluster < ActiveRecord::Base
  has_many :marks

  LEADER_TIMESPAN = 7.days.ago

  def assign_mark(mark_name)
    m = Mark.find_by(name: mark_name)
    if m
      m.assign_cluster(self)
    end
  end

  def top_users(n, filter_staff)
    markings = Marking.where('updated_at > ?',LEADER_TIMESPAN).where(mark_id: self.marks.map(&:id)).where(markable_type: "UserIdentity")
    markings = markings.group(:markable_id).sum(:weight).sort_by{|k, v| -v}.take(n)
    r = markings.map{|k,v| [UserIdentity.find_by(id: k).user.username, v]}

    if filter_staff
      r = r.select{|a, b| !User.find_by(username: a).is_staff}
    end
    r.sort_by{|a,b| -b}
  end


end
