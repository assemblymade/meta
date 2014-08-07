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
    if comments = object.main_thread.try(:comments)
      comments.order(created_at: :desc).first.try(:updated_at).try(:to_i)
    end
  end
end
