require 'readraptor_tracker'

class ChatRoomSerializer < ActiveModel::Serializer
  attributes :id, :label, :url, :updated, :readraptor_url, :product_name

  def id
    object.key
  end

  def label
    object.slug
  end

  # This is unix time rather than iso8601 because it's compared with the timestamp
  # from readraptor, which is also unix time
  def updated
    object.updated_at.to_i
  end

  def readraptor_url
    if scope
      ReadraptorTracker.new(object.key, scope.id).url
    end
  end
end
