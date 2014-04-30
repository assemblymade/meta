class ProductSerializer < ActiveModel::Serializer

  attributes :id, :url
  attributes :name, :pitch, :path, :slug, :stage

  def url
    product_path(object)
  end

  # Legacy
  attributes :path
  alias_method :path, :url

end
