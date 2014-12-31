class AddMarkIdentity
  include Sidekiq::Worker
  def perform(user_id, mark_vector, scalar)

    user = User.find(user_id)
    user_identity = user.user_identity
    old_mark_vector = QueryMarks.new.mark_vector_for_object(user_identity)

    if scalar != 1
      new_mark_vector = QueryMarks.new.scale_mark_vector(mark_vector, scalar)
    end

    cumulative_mark_vector = QueryMarks.new.add_mark_vectors(old_mark_vector, mark_vector)
    QueryMarks.new.update_markings_to_vector_for_object(user_identity, cumulative_mark_vector)
  end
end
