class ProductSerializer < ActiveModel::Serializer

  attributes :id, :url
  attributes :name, :pitch, :slug

  def url
    product_path(object)
  end

end
