class BaseSerializer < ActiveModel::Serializer

  attributes :type, :id
  attributes :created, :updated

  def type
    object.class.name.downcase
  end

  def created
    object.created_at.iso8601
  end

  def updated
    object.updated_at.iso8601
  end

end
