class Event::TitleChangeSerializer < EventSerializer
  attributes :old_title

  def old_title
    object.body
  end
end