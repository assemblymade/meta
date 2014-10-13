class CryptoWorker
  include Sidekiq::Worker


  def send_btc_from_central(destination, amount)
    private_key = ENV.fetch("CENTRAL_ADDRESS_PRIVATE_KEY")
    public_address= ENV.fetch("CENTRAL_ADDRESS_PUBLIC_ADDRESS")

    params = {"public_address" => public_address}
    params[:destination] =  destination
    params[:private_key] = private_key
    params[:amount] = amount

    Faraday.post 'https://coins.assembly.com/v1/btc', params.to_json

  end


  def create_coins(product_id, total_coins)

    product = Product.find_by(id: product_id)

    body={}
    body['public_address'] = product.wallet_public_address
    body['private_key'] = product.wallet_private_key
    body['fee_each'] = ENV.fetch("STANDARD_BTC_FEE")
    body['name'] = product.name+" Coins"
    body['email'] = "barisser@assembly.com"
    body['description'] = "" #We can think about this for later
    body['initial_coins'] = total_coins.to_s

    Faraday.post 'https://coins.assembly.com/v1/colors', body.to_json
  end

  def issue_additional_coins

  end

  def award_coins(product_id, user_id, coins)
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

  def transfer_coins(product_id, giver_user_id, recipient_user_id, coins)
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
