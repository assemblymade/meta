class ReadRaptorSerializer
  # article keys are sent to readraptor in the format klass_id
  # eg: Discussion_709e5e3d-613f-48ba-b3ad-2cccf18cac90

  def self.serialize_entities(entities, tag=nil)
    Array(entities).map{|o| serialize_entity(o.class.base_class.to_s, o.id, tag) }
  end

  def self.serialize_entity(type, id, tag=nil)
    [type, id, tag].compact.join('_')
  end

  def self.deserialize(articles)
    entities = []
    articles.group_by{|a| a[:type] }.each do |type, articles|
      ids = articles.map{|a| a[:id] }
      type.constantize.base_class.where(id: ids).to_a.compact.each do |o|
        entities << o
      end
    end
    entities
  end
end