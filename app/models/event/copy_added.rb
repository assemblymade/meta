class Event::CopyAdded < Event
  validates :event_id, presence: true

  # TODO: (whatupdave) event_id should be a generic polymorphic association eg. 'target_id'
  def deliverable
    ::CopyDeliverable.find(event_id)
  end

  def deliverable=(copy)
    self.event_id = copy.id
  end
  
  def awardable?
    true
  end
end