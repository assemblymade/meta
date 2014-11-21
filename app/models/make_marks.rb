class MakeMarks

  DEFAULT_MARKING_WEIGHT = 1.0

  def mark_it(object, mark)
    if not Marking.where(markable_id: object.id).where(mark_id: mark.id).present?
      Marking.create!({markable: object, mark_id: mark.id, weight: DEFAULT_MARKING_WEIGHT})
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
    if destroyed_mark = Mark.find_by(name: destroyed_mark_name) && into_existing_mark = Mark.find_by(name: into_existing_mark_name)
      old_markings = Marking.where(mark_id: destroyed_mark.id)
      old_markings.each do |o|
        o.update!({mark_id: into_existing_mark.id})
      end
      destroyed_mark.destroy
    end
  end


end
