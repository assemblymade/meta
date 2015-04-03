class CoinInfoSerializer < ApplicationSerializer
  attributes :type, :asset_ids, :contract_url, :name, :issuer, :description, :description_mime, :divisibility, :link_to_website, :icon_url, :image_url, :version

  def type
    "Ownership"
  end

  def asset_ids
    [object.asset_address]
  end

  def description
    object.product.description
  end

  def description_mime
    "text/x-markdown; charset=UTF-8"
  end

  def divisibility
    1
  end

  def link_to_website
    true
  end

  def icon_url
    object.product.full_logo_url
  end

  def image_url
    object.product.full_logo_url
  end

end
