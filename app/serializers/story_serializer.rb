class StorySerializer < ApplicationSerializer
  attributes :verb
  attributes :subject_type

  attributes :actor_ids

  def actor_ids
    object.activities.pluck(:actor_id)
  end
end
