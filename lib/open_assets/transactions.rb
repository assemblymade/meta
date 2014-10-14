module OpenAssets
  class Transactions

    def get_btc_balance(public_address)
      url = "https://blockchain.info/"
      remote = OpenAssets::Remote.new(url)
      end_url="q/addressbalance/"+public_address

      satoshi_balance = remote.get end_url
      btc_balance = satoshi_balance.to_f/100000000

      return btc_balance
    end

    def send_btc(public_address, destination, private_key, amount)
      private_key = ENV.fetch("CENTRAL_ADDRESS_PRIVATE_KEY")
      public_address= ENV.fetch("CENTRAL_ADDRESS_PUBLIC_ADDRESS")

      params = {"public_address" => public_address}
      params[:destination] =  destination
      params[:private_key] = private_key
      params[:amount] = amount

      remote = OpenAssets::Remote.new("https://coins.assembly.com")
      end_url="v1/btc"
      remote.post end_url, params.to_json
    end


    def forge_coins(product_id, total_coins)
      product = Product.find_by(id: product_id)

      body={}
      body['public_address'] = product.wallet_public_address
      body['private_key'] = product.wallet_private_key
      body['fee_each'] = ENV.fetch("STANDARD_BTC_FEE")
      body['name'] = product.name+" Coins"
      body['email'] = "barisser@assembly.com"
      body['description'] = "" #We can think about this for later
      body['initial_coins'] = total_coins.to_s

      remote = OpenAssets::Remote.new("https://coins.assembly.com")
      end_url="v1/colors"
      remote.post end_url, body.to_json
    end


    def transfer_coins(product_id, user_id, coins)
      product = Product.find_by(id: product_id)
      user = User.find_by(id: user_id)

      body={}
      body['from_public_address'] = product.wallet_public_address
      body['to_public_address'] = user.wallet_public_address
      body['fee_each'] = ENV.fetch("STANDARD_BTC_FEE")
      body['from_private_key'] = product.wallet_private_key
      body['issuing_address'] = product.wallet_public_address
      body['transfer_amount'] = coins.to_s

      remote = OpenAssets::Remote.new("https://coins.assembly.com")
      end_url="v1/transactions/transfer"
      remote.post end_url, body.to_json
    end

  end
end
