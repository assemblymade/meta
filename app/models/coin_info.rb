class CoinInfo < ActiveRecord::Base
  belongs_to :product

  def self.create_from_product!(product)
    CoinInfo.create!({
      name: "#{self.name} Coin",
      version: "1.0",
      product_id: product.id,
      asset_address: ""
    })
  end
end
