class ListSerializer < ActiveModel::Serializer
  attributes :count, :items

  def items
    object.map {|item| @options.fetch(:serializer).new(item, scope: scope).as_json }
  end

  def count
    items.count
  end

end
