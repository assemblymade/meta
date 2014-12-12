class UserCluster < ActiveRecord::Base
  has_many :users

  def center
    my_mark_vector = []
    self.users.each do |user|
      user_vector = user.user_identity.get_mark_vector
      scalar = 1.0 / self.users.count.to_f
      scaled_user_vector = QueryMarks.new.scale_mark_vector(user_vector, scalar)
      my_mark_vector = QueryMarks.new.add_mark_vectors(my_mark_vector, scaled_user_vector)
    end
  end

end
