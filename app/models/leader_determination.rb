class LeaderDetermination
  def sorted_marks
    recent_users = User.where('last_sign_in_at > ?',30.days.ago).where(is_staff: false)

    top_users = {}
    top_marks = Marking.group('mark_id').sum(:weight).select{|a, b| b > 0}.sort_by{|k, v| -v}
    top_marks = top_marks.map{|a, b| [Mark.find_by(id: a).name, []]}.take(30)
    top_marks.append(["Overall", []])
    top_marks = top_marks.to_h

    scores = []

    recent_users.each do |a|
      top_work = a.user_awards_score.take(5)
      top_work.each do |g|
        if top_marks.has_key?(g[0])
          top_marks[g[0]].append([a.username, g[1]])
        end
      end
    end

    sorted_ranks = {}

    top_marks.each do |k, v|
      sorted_ranks[k] = v.sort_by{|a, b| -b}.take(5)
    end

    sorted_ranks
  end

  def rankings(mark_name)
    p = LeaderPosition.where(leader_type: mark_name)
    p = p.select{|a| a.user}
    p.map{|a| [a.user.username, a.rank] }
  end

  def assemble_rank_data
    d = {}
    lpt = LeaderPosition.pluck(:leader_type).uniq
    lpt.each do |p|
      d[p] = LeaderPosition.where(leader_type: p).map{|a| [a.user.username, a.rank, UserSerializer.new(a.user).full_url]}
    end
    d
  end

  def cluster_rank_data(mark_cluster, sorted_mark_data)
    r = {}
    mark_cluster.marks.each do |a|
      if sorted_mark_data.has_key?(a.name)
        sorted_mark_data[a.name].each do |p|
          person = p[0]
          v = p[1]
          if r.has_key?(person)
            r[person] = r[person] + v
          else
            r[person] = v
          end
        end
      end
    end
    r.sort_by{|k, v| -v}
  end

  def all_cluster_ranks
    a = sorted_marks
    r = {}
    MarkCluster.all.each do |m|
      r[m.name] = cluster_rank_data(m, a)
    end
    r['Overall'] = a["Overall"]
    d = {}
    r.each do |k, v|
      d[k] = v.take(5)
    end
    d.sort_by{|k, v| -v.sum{|a, b| b}}
  end

end
