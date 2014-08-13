class TaskDecorator < WipDecorator
  decorates_association :watchers

  def deliverable_icon_class
    "#{task.deliverable}-icon"
  end
end
