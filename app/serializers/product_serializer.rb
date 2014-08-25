class ProductSerializer < ApplicationSerializer

  attributes :url
  attributes :name, :pitch, :slug, :quality

  def url
    product_path(object)
  end

end
