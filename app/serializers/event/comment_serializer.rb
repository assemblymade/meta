class Event::CommentSerializer < EventSerializer

  def anchor
    "event-#{object.number}"
  end

end
