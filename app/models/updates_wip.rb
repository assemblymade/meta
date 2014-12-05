class UpdatesWip
  attr_accessor :wip, :params, :user, :priority_above_id

  def self.update(wip, params, user)
    new(wip, params, user).update
  end

  def initialize(wip, params, user)
    self.wip = wip
    self.priority_above_id = params[:priority_above_id]
    self.params = params.except(:priority_above_id)
    self.user = user
  end

  def update
    ActiveRecord::Base.transaction do
      update_title
      update_tags
      update_priority

      wip.update(params)
    end

    wip
  end

  def update_title
    return if title.blank? || title == wip.title

    wip.update_title!(current_user, title)
  end

  def update_tags
    return if tag_list.blank?

    tag_list.each do |t|
      MakeMarks.new.mark_with_name(wip, t)
    end

    wip.update_tag_names!(current_user, tag_list)
  end

  def update_priority
    return unless priority_above

    old_priority = wip.priority

    if old_priority > priority_above.priority
      operation = '+'
      new_priority = priority_above.priority
      priority_range = Range.new(new_priority, old_priority - 1)
    else
      operation = '-'
      new_priority = priority_above.priority - 1
      priority_range = Range.new(old_priority + 1, new_priority)
    end

    product.tasks.
      where(priority: priority_range).
      update_all("priority = priority #{operation} 1")

    wip.priority = new_priority
  end

  def title
    params[:title]
  end

  def tag_list
    params[:tag_list]
  end

  def priority_above
    return unless priority_above_id

    product.tasks.find_by(id: priority_above_id)
  end

  def product
    wip.product
  end
end
