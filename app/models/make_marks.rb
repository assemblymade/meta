class MakeMarks

  DEFAULT_MARKING_WEIGHT = 1.0

  def mark_it(object, mark)
    if not Marking.where(markable_id: object.id).where(mark_id: mark.id).present?
      Marking.create!({markable: object, mark_id: mark.id, weight: DEFAULT_MARKING_WEIGHT})
    end
  end

  def mark_with_name(object, mark_name)
    themark = Mark.find_by(name: mark_name)
    if themark.nil?
      themark = Mark.create!({name: mark_name})
    end
    mark_it(object, themark)
  end
end
