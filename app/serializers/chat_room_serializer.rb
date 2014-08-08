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
    object.main_thread.try(:updated_at).try(:to_i)
  end
end
