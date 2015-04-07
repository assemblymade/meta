class AdjustMarkings
  include Sidekiq::Worker
  def perform(markable_id, markable_type, marked_object_id, marked_object_type, scalar)

    markable = determine_markable(markable_type, markable_id)

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

    old_mark_vector = QueryMarks.new.mark_vector_for_object(markable)

    if marked_object
      new_mark_vector = calculate_new_mark_vector(marked_object)
      mark_vector_stuff(scalar, old_mark_vector, new_mark_vector, markable)
    end
  end

  def determine_markable(markable_type, markable_id)
    if markable_type == "User"
      user = User.find(markable_id)
      markable = user.user_identity
    elsif markable_type == "Product"
      markable = Product.find(markable_id)
    elsif markable_type == "Wip"
      markable = Wip.find(markable_id)
    end
    markable
  end

  def calculate_new_mark_vector(marked_object)
    if marked_object.class.name == "Wip"
      new_mark_vector = marked_object.normalized_mark_vector
    elsif marked_object.class.name == "Product"
      new_mark_vector = marked_object.normalized_mark_vector
    else
      new_mark_vector = QueryMarks.new.normalized_mark_vector_for_object(marked_object)
    end
  end

  def mark_vector_stuff(scalar, old_mark_vector, new_mark_vector, markable)
    if scalar != 1
      new_mark_vector = QueryMarks.new.scale_mark_vector(new_mark_vector, scalar)
    end

    cumulative_mark_vector = QueryMarks.new.add_mark_vectors(old_mark_vector, new_mark_vector)
    QueryMarks.new.update_markings_to_vector_for_object(markable, cumulative_mark_vector)
  end

end
