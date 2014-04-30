class Event::TypeChange < Event
  validates :body, presence: true

  def previous_type
    body
  end

  def previous_type=(type)
    self.body = type
  end
  
  def previous_type_name
    previous_type.downcase.pluralize
  end
end