class ChatRoomSerializer < ActiveModel::Serializer
  attributes :id, :label, :url, :updated

  def id
    object.key
  end

  def label
    object.slug
  end

  def url
    chat_room_path(object)
  end

  def updated
    last_event.try(:created_at).try(:to_i)
  end

  def last_event
    object.wip.events.order(:created_at).select(:created_at).last
  end
end
