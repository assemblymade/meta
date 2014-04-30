class TeamSerializer < ActiveModel::Serializer
  attributes :count, :members

  def count
    object.size
  end

  def members
    object.map {|obj| UserSerializer.new(obj) }
  end

end
