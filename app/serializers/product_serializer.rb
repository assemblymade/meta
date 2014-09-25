class ProductSerializer < ApplicationSerializer

  attributes :url
  attributes :name, :pitch, :slug, :quality, :average_bounty

  def url
    product_path(object)
  end

end
