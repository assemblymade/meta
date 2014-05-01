class Event::CommentSerializer < EventSerializer

  def anchor
    "comment-#{object.number}"
  end

end
