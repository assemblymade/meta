class AdjustMarkings
  include Sidekiq::Worker
  def perform(user_id, marked_object_id, marked_object_type, scalar)

    user = User.find(user_id)

    if marked_object_type == "Product"
      marked_object = Product.where(id: marked_object_id)
      if marked_object.present?
        marked_object = marked_object.first
      else
        marked_object = nil
      end
    elsif marked_object_type == "Wip"
      marked_object = Wip.where(id: marked_object_id)
      if marked_object.present?
        marked_object = marked_object.first
      else
        marked_object = nil
      end
    end

    user_identity = user.user_identity

    old_mark_vector = QueryMarks.new.mark_vector_for_object(user_identity)

    if marked_object
      if marked_object.class.name == "Wip"
        new_mark_vector = marked_object.normalized_mark_vector
      elsif marked_object.class.name == "Product"
        new_mark_vector = marked_object.normalized_mark_vector
      else
        new_mark_vector = QueryMarks.new.normalized_mark_vector_for_object(marked_object)
      end

      if scalar != 1
        new_mark_vector = QueryMarks.new.scale_mark_vector(new_mark_vector, scalar)
      end

      cumulative_mark_vector = QueryMarks.new.add_mark_vectors(old_mark_vector, new_mark_vector)
      QueryMarks.new.update_markings_to_vector_for_object(user_identity, cumulative_mark_vector)

    end

  end
end
