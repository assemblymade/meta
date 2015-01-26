class ApplicationSerializer < ActiveModel::Serializer
  attributes :id, :type, :created_at, :updated_at

  def type
    object.class.name.underscore
  end

  def id
    return unless object.respond_to?(:id)

    object.id
  end

  def created_at
    return unless object.respond_to?(:created_at)

    object.created_at.try(:iso8601)
  end

  def updated_at
    return unless object.respond_to?(:updated_at)

    object.updated_at.try(:iso8601)
  end
end
