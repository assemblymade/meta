class PartnerSerializer < ActiveModel::Serializer
  attributes :assets

  def product
    ProductShallowSerializer.new(Product.find(object[0]))
  end

  def coins
    object[1]
  end
end
