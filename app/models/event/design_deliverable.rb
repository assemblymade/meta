class Event::DesignDeliverable < Event
  validates :event_id, presence: true

  # TODO: (whatupdave) event_id should be a generic polymorphic association eg. 'target_id'
  def attachment
    Attachment.find(event_id)
  end

  def attachment=(attachment)
    self.event_id = attachment.id
  end
  
  def awardable?
    true
  end
end