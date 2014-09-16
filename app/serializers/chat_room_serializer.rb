class ChatRoomSerializer < ActiveModel::Serializer
  attributes :id, :label, :url, :updated, :readraptor_url, :product_name

  def id
    object.key
  end

  def label
    object.slug
  end

  def product_name
    object.product && object.product.name
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

  def readraptor_url
    ReadraptorTracker.new(object.key, scope.id).url
  end
end
