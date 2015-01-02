class MakeMarks

  DEFAULT_MARKING_WEIGHT = 1.0

  def mark_it(object, mark)
    if not Marking.where(markable_id: object.id).where(mark_id: mark.id).present?
      Marking.create!({markable: object, mark_id: mark.id, weight: DEFAULT_MARKING_WEIGHT})
    end
  end

  def mark_additively(object, mark_id, weight)
    marking = Marking.where(markable_id: object.id).where(mark_id: mark_id)
    if not marking.present?
      Marking.create!({markable: object, mark_id: mark_id, weight: weight})
    else
      marking=marking.first #there should only ever be 1 entry here
      oldweight = marking.weight
      marking.update!({weight: oldweight + weight})
    end
  end

  def mark_with_name(object, mark_name)
    mark_name = mark_name.downcase
    themark = Mark.find_by(name: mark_name)
    if themark.nil?
      themark = Mark.create!({name: mark_name})
    end
    mark_it(object, themark)
  end

  def merge_marks(destroyed_mark_name, into_existing_mark_name)
    if destroyed_mark = Mark.find_by(name: destroyed_mark_name)
      if into_existing_mark = Mark.find_by(name: into_existing_mark_name)
        old_markings = Marking.where(mark_id: destroyed_mark.id)
        old_markings.each do |o|
          o.update!({mark_id: into_existing_mark.id})
        end
        destroyed_mark.destroy
      end
    end
  end

  def mark_with_vector_additively(object , mark_vector, weight)
    if weight != 1
      mark_vector = QueryMarks.new.scale_mark_vector(mark_vector, weight)
    end

    mark_vector.each do |v|
      mark_additively(object, v[0], v[1])
    end
  end

  def mark_with_object_for_viewings(user_id, viewable_id, viewable_type, scalar)
    if viewable_type == "Product"
      viewable = Product.find(viewable_id)
    elsif viewable_type == "Wip"
      viewable = Wip.find(viewable_id)
    end

    applicable_viewings = Viewing.where(user_id: user_id, viewable_id: viewable_id)
    previous_views = applicable_viewings.count

    view_weight = 1.0

    if previous_views == 0
      Viewing.create!({user_id: user_id, viewable_id: viewable_id, viewable_type: viewable_type, weight: view_weight})
      AdjustMarkings.perform_async(user_id, viewable.id, viewable_type, scalar * Math.sqrt(view_weight))
    else
      new_weight = applicable_viewings.first.weight + view_weight
      applicable_viewings.first.update(weight: new_weight)
      diff = Math.sqrt(new_weight) - Math.sqrt(view_weight)
      AdjustMarkings.perform_async(user_id, viewable.id, viewable_type, scalar * diff)
    end
  end

end
