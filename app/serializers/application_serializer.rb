class ApplicationSerializer < ActiveModel::Serializer

  attributes :type, :id
  attributes :created, :updated

  def type
    object.class.name.underscore
  end

  def created
    object.created_at.iso8601
  end

  def updated
    object.updated_at.iso8601 if object.respond_to?(:updated_at)
  end

end
