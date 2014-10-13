Class TransferCoins

  def perform(product_id, giver_user_id, recipient_user_id, coins)
    product = Product.find_by(id: product_id)
    sender = User.find_by(id: giver_user_id)
    receiver = User.find_by(id: recipient_user_id)

    body={}
    body['from_public_address'] = sender.wallet_public_address
    body['to_public_address'] = receiver.wallet_public_address
    body['fee_each'] = ENV.fetch("STANDARD_BTC_FEE")
    body['from_private_key'] = sender.wallet_private_key
    body['issuing_address'] = product.wallet_public_address
    body['transfer_amount'] = coins.to_s

    Faraday.post 'https://coins.assembly.com/v1/transactions/transfer', body.to_json
  end

end
