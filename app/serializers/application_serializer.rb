class ApplicationSerializer < ActiveModel::Serializer

  attributes :type, :id
  attributes :created, :created_at, :updated, :updated_at

  def type
    object.class.name.underscore
  end

  def created
    object.created_at.try(:iso8601)
  end

  def created_at
    object.created_at
  end

  def updated
    object.updated_at.try(:iso8601) if object.respond_to?(:updated_at)
  end

  def updated_at
    object.updated_at if object.respond_to?(:updated_at)
  end
end
