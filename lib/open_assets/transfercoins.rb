module OpenAssets
  class TransferCoins

    def transfer(product_id, user_id, coins)
      product = Product.find_by(id: product_id)
      user = User.find_by(id: user_id)

      body={}
      body['from_public_address'] = product.wallet_public_address
      body['to_public_address'] = user.wallet_public_address
      body['fee_each'] = ENV.fetch("STANDARD_BTC_FEE")
      body['from_private_key'] = product.wallet_private_key
      body['issuing_address'] = product.wallet_public_address
      body['transfer_amount'] = coins.to_s

      Faraday.post 'https://coins.assembly.com/v1/transactions/transfer', body.to_json
    end


  end
end
