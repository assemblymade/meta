class ChatRoomSerializer < ActiveModel::Serializer
  attributes :id, :label, :url, :updated

  def id
    object.chat_room_key
  end

  def label
    object.name
  end

  def url
    product_chat_path(object)
  end

  def updated
    last_event.try(:created_at).try(:to_i)
  end

  def last_event
    if wip = object.main_thread
      wip.events.order(:created_at).select(:created_at).last
    end
  end
end
