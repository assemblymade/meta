class SlackActivitySerializer < ApplicationSerializer
  attributes :verb, :url

  def verb
    object.type
  end

  def url
    target_entity = object.subject_type == 'Event' ? object.target : object.subject
    polymorphic_url(
      [target_entity.product, target_entity]
    )
  end
end