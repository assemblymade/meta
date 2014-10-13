class ProductSerializer < ApplicationSerializer

  attributes :url, :wips_url
  attributes :name, :pitch, :slug, :quality, :average_bounty

  def wips_url
    product_wips_path(object)
  end

  def url
    product_path(object)
  end

end
