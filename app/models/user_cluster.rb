class UserCluster
  attr_accessor :users, :mark_vector, :variance
  def initialize
    @users = []
    @mark_vector = []
    @variance = 0
  end

  def add_user_id(user_id, user_vector)
    if not self.users.include?(user_id)
      @users.append(user_id)
      @oldmarkvector = @mark_vector
      @mark_vector = QueryMarks.new.add_mark_vectors(@mark_vector, user_vector)
      average_vector = QueryMarks.new.scale_mark_vector(@mark_vector, 1.0 / @users.count.to_f)
      if @users.count > 1
        average_old_vector = QueryMarks.new.scale_mark_vector( @oldmarkvector, 1.0 / (@users.count.to_f-1.0))
      else
        average_old_vector = []
      end

      variance_change = QueryMarks.new.add_mark_vectors(QueryMarks.new.scale_mark_vector(average_old_vector , -1), user_vector).sum{|a| a[1]**2}
      variance_change = variance_change * QueryMarks.new.add_mark_vectors(user_vector, QueryMarks.new.scale_mark_vector(average_vector ,-1)).sum{|a| a[1]**2}
      @variance = @variance + Math.sqrt(variance_change)
    end
  end

  def average_vector
    s = @mark_vector.sum{|a| a[1]**2}
    QueryMarks.new.scale_mark_vector(@mark_vector, 1.0 / s).sort_by{|a| -1*a[1]}
  end

  def remove_user_id(user_id, user_vector)
    @users.delete(user_id)
    average_old_vector = QueryMarks.new.scale_mark_vector(@mark_vector, 1.0 / @users.count.to_f)
    @mark_vector = QueryMarks.new.add_mark_vectors(@mark_vector, QueryMarks.new.scale_mark_vector(user_vector, -1))
    if @users.count > 0
      average_vector = QueryMarks.new.scale_mark_vector(@mark_vector, 1.0 / @users.count.to_f)
    else
      average_vector = []
    end

    variance_change = QueryMarks.new.add_mark_vectors(QueryMarks.new.scale_mark_vector(average_old_vector , -1), user_vector).sum{|a| a[1]**2}
    variance_change = variance_change * QueryMarks.new.add_mark_vectors( user_vector, QueryMarks.new.scale_mark_vector(average_vector ,-1)).sum{|a| a[1]**2}
    @variance = @variance - Math.sqrt(variance_change)
  end
end
