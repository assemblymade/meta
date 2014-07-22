class Event::CodeAdded < Event
  validates :event_id, presence: true

  # TODO: (whatupdave) event_id should be a generic polymorphic association eg. 'target_id'
  def deliverable
    ::CodeDeliverable.find(event_id)
  end

  def deliverable=(code)
    self.event_id = code.id
  end
  
  def awardable?
    true
  end  
end
