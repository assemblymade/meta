class WipTagSerializer < ActiveModel::Serializer
  attributes :color, :name

  def name
    object.name
  end

  def color
    object.color
  end
end
