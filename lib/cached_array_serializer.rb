class CachedArraySerializer
  def initialize(objects)
    @objects = objects
  end

  def as_json
    @objects.map do |object|
      Rails.cache.fetch([object, :serialized]) do
        object.active_model_serializer.new(object).as_json
      end
    end
  end
end
