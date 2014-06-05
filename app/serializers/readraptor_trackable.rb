module ReadraptorTrackable
  extend ActiveSupport::Concern

  included do
    attributes :readraptor_track_id
  end

  def readraptor_track_id
    ReadraptorTracker.new(ReadRaptorSerializer.serialize_entities(object, object.readraptor_tag).first, scope.id).url if scope
  end
end
