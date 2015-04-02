class CoinInfo < ActiveRecord::Base
  belongs_to :product

  def self.create_from_product!(product)
    CoinInfo.create!({
      asset_address: "",
      coin_type: "Ownership",
      description: product.description,
      description_mime: "text/x-markdown; charset=UTF-8",
      divisibility: 1,
      icon_url: product.full_logo_url,
      image_url: product.full_logo_url,
      link_to_website: true,
      name: "#{product.name} Coin",
      product_id: product.id,
      version: "1.0",
    })

  end
end
