class CoinInfoSerializer < ApplicationSerializer
  attributes :type, :asset_address, :contract_url, :name, :issuer, :description, :description_mime, :divisibility, :link_to_website, :icon_url, :image_url, :version

  def type
    object.coin_type
  end
end
