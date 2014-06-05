class ProductSerializer < ApplicationSerializer

  attributes :url
  attributes :name, :pitch, :slug

  def url
    product_path(object)
  end

end
