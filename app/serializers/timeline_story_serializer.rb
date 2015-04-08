class TimelineStorySerializer < StorySerializer
  attributes :verb, :subject

  def verb
    story.display_verb
  end

  def subject
    story.display_subject
  end

  def story
    StorySentences.new(object)
  end
end
