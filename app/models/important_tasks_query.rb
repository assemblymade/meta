class ImportantTasksQuery
  attr_accessor :deliverable

  def self.call(deliverable = nil)
    new(deliverable).most_important_tasks
  end

  def initialize(deliverable = nil)
    self.deliverable = deliverable
  end

  def most_important_tasks
    Task.all.
      merge(public_tasks).
      merge(open_tasks).
      merge(tasks_for_deliverable).
      merge(ordered_by_importance).
      limit(8)
  end

  def ordered_by_importance
    Task.order('trending_score DESC, promoted_at IS NOT NULL DESC')
  end

  def tasks_for_deliverable
    if deliverable
      Task.where(deliverable: deliverable)
    else
      Task.all
    end
  end

  def open_tasks
    Task.where(state: 'open')
  end

  def public_tasks
    Task.joins(:product).where(products: { flagged_at: nil })
  end
end
