class LeaderboardSerializer < ActiveModel::Serializer
  attributes :items

  def items
    object.items.map {|item| LeaderboardItemSerializer.new(item) }
  end

end
