class LeaderboardItemSerializer < ActiveModel::Serializer
  attributes :item, :value, :rank, :percent

  def item
    AuthorSerializer.new(object.item)
  end

  def rank
    object.rank + 1
  end

end
