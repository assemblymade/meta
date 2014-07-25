class StorySerializer < ApplicationSerializer
  attributes :verb
  attributes :subject_type

  attributes :actor_ids
  attributes :url

  def actor_ids
    object.activities.pluck(:actor_id)
  end

  def url
    story_path(object)
  end
end
