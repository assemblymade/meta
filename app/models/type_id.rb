# simple serializer for getting a type, id combo
class TypeId
  def self.as_json(key, object)
    {
      "#{key}_type" => object.class.base_class.to_s,
      "#{key}_id" => object.id
    }
  end
end