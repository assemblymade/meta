class UserCluster < ActiveRecord::Base
  has_many :users
  has_many :markings

  def calculate_center
    my_mark_vector = []
    self.users.each do |user|
      user_vector = user.user_identity.get_mark_vector
      my_mark_vector = QueryMarks.new.add_mark_vectors(my_mark_vector, user_vector)
    end
    QueryMarks.new.update_markings_to_vector_for_object(self, my_mark_vector)
  end

  def add_user(user)
    user_vector = user.user_identity.get_mark_vector
    my_mark_vector = QueryMarks.new.add_mark_vectors(my_mark_vector, user_vector)
    QueryMarks.new.update_markings_to_vector_for_object(self, my_mark_vector)
    self.users.append(user)
  end

  def remove_user(user)
    user_vector = user.user_identity.get_mark_vector
    scaled_user_vector = QueryMarks.new.scale_mark_vector(user_vector, -1.0)
    my_mark_vector = QueryMarks.new.add_mark_vectors(my_mark_vector, scaled_user_vector)
    QueryMarks.new.update_markings_to_vector_for_object(self, my_mark_vector)
    self.users.delete(user)
  end

  def normalized_center
    QueryMarks.new.normalized_mark_vector_for_object(self)
  end

  def variance
    my_center = self.center
    sum_variance = 0
    self.users.each do |user|
      their_vector = user.user_identity.get_mark_vector
      sum_variance = sum_variance + vector_square_distance(my_center, their_vector)
    end
    self.variance.update!({variance: sum_variance})
    sum_variance
  end


end
