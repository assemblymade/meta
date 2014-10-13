module OpenAssets
  class CreateCoins

    def forgecoins(product_id, total_coins)
      product = Product.find_by(id: product_id)

      body={}
      body['public_address'] = product.wallet_public_address
      body['private_key'] = product.wallet_private_key
      body['fee_each'] = ENV.fetch("STANDARD_BTC_FEE")
      body['name'] = product.name+" Coins"
      body['email'] = "barisser@assembly.com"
      body['description'] = "" #We can think about this for later
      body['initial_coins'] = total_coins.to_s

      response = Faraday.post 'https://coins.assembly.com/v1/colors', body.to_json
    end

  end

end
