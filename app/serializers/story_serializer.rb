class StorySerializer < ApplicationSerializer
  attributes :verb
  attributes :subject_type

  attributes :actor_ids
  attributes :url

  def actor_ids
    object.activities.pluck(:actor_id)
  end

  def url
    "google.com"
  end
end
