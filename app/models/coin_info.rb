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

  def coinprism_url
    if self.asset_address
      if self.asset_address.length > 10
        "https://www.coinprism.info/asset/#{self.asset_address}"
      else
        "https://www.coinprism.info/address/#{self.product.wallet_public_address}"
      end
    end
  end

end
