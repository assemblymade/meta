class StorySerializer < ApplicationSerializer
  attributes :verb
  attributes :subject_type

  attributes :actor_ids
  attributes :url
  attributes :body_preview

  def actor_ids
    object.activities.pluck(:actor_id)
  end

  def url
    story_path(object)
  end

  def body_preview
    "Yo, <a href='#'>@whatupdave</a>, what's the deal with <a href='#'>#42</a>?"
  end
end
