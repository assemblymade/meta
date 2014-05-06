class ReadRaptorSerializer
  # article keys are sent to readraptor in the format klass_id
  # eg: Discussion_709e5e3d-613f-48ba-b3ad-2cccf18cac90

  def self.serialize_entities(entities)
    entities.map{|o| [o.class.to_s, o.id].join('_') }
  end

  def self.deserialize_articles(keys)
    entities = []
    keys.map{|id| id.split('_') }.group_by{|type, id| type }.each do |type, type_ids|
      ids = type_ids.map{|t, id| id }
      type.constantize.where(id: ids).to_a.compact.each do |o|
        entities << o
      end
    end
    entities
  end
end