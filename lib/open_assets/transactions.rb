module OpenAssets
  class Transactions

    SATOSHIS=100_000_000

    def get_btc_balance(public_address)
      url = "https://blockchain.info/"
      remote = OpenAssets::Remote.new(url)
      end_url="q/addressbalance/"+public_address

      satoshi_balance = remote.get end_url
      btc_balance = satoshi_balance.to_f/SATOSHIS

      return btc_balance
    end

    def get_central_btc_balance()
      return get_btc_balance(ENV.fetch("CENTRAL_ADDRESS_PUBLIC_ADDRESS"))
    end

    def send_btc(destination, amount)
      private_key = ENV.fetch("CENTRAL_ADDRESS_PRIVATE_KEY")
      public_address= ENV.fetch("CENTRAL_ADDRESS_PUBLIC_ADDRESS")

      params = {
        public_address: public_address,
        destination: destination,
        private_key: private_key,
        amount: amount
      }

      current_price = get_btc_spot_price_coinbase()*100
      sender = "Assembly Central"
      recipient = destination
      sender_address = public_address
      recipient_address = destination
      BtcPayment.create!({btcusdprice_at_moment: current_price, created_at: DateTime.now, action: "Sent BTC", sender: sender, recipient: recipient, sender_address: sender_address, recipient_address: recipient_address, btc_change: amount*-100000000})


      remote = OpenAssets::Remote.new("https://coins.assembly.com")
      end_url="v1/btc"
      remote.post end_url, params.to_json

    end


    def forge_coins(product_id, total_coins)
      product = Product.find(product_id)

      body = {
        public_address: product.wallet_public_address,
        private_key: product.wallet_private_key,
        fee_each: ENV.fetch("STANDARD_BTC_FEE"),
        name: product.name + " Coins",
        email: "barisser@assembly.com",
        description: "",
        initial_coins: total_coins.to_s
      }

      puts "Forging #{total_coins}  #{product.name} Coins for #{product.wallet_public_address}"

      remote = OpenAssets::Remote.new("https://coins.assembly.com")
      end_url="v1/colors"
      remote.post end_url, body.to_json
    end


    def award_coins(product_id, user_id, coins)
      product = Product.find(product_id)
      user = User.find(user_id)

      body = {
        from_public_address: product.wallet_public_address,
        to_public_address: user.wallet_public_address,
        fee_each: ENV.fetch("STANDARD_BTC_FEE"),
        from_private_key: product.wallet_private_key,
        issuing_address: product.wallet_public_address,
        transfer_amount: coins.to_s,
        type: ""
      }

      remote = OpenAssets::Remote.new("https://coins.assembly.com")
      end_url="v1/transactions/transfer"
      remote.post end_url, body.to_json
    end

    def transfer_coins(sender, receiver, coins, product, type)

      issuing_address = product.wallet_public_address
      from_public_address = sender.wallet_public_address
      from_private_key = sender.wallet_private_key
      to_public_address = receiver.wallet_public_address

      body = {
        issuing_address: issuing_address,
        to_public_address: to_public_address,
        fee_each: ENV.fetch("STANDARD_BTC_FEE"),
        from_public_address: from_public_address,
        from_private_key: from_private_key,
        transfer_amount: coins.to_s,
        type: type
      }

      remote = OpenAssets::Remote.new("https://coins.assembly.com")
      end_url="v1/transactions/transfer"
      remote.post end_url, body.to_json

    end

    def get_btc_pair()
      url = "https://coins.assembly.com"
      remote = OpenAssets::Remote.new(url)
      end_url="/v1/addresses"

      pair = remote.get end_url
    end

    def get_btc_spot_price_coinbase()
      url = "https://coinbase.com"
      remote = OpenAssets::Remote.new(url)
      end_url = "/api/v1/prices/spot_rate"
      price = remote.get end_url
      price = price['amount'].to_f
    end

    def btc_pay_user(username, user_public_address, amount)
      send_btc(destination, amount)
      current_price = get_btc_spot_price_coinbase()*100
      BtcPayment.create!({btcusdprice_at_moment: current_price, created_at: DateTime.now, action: "Paid User", sender: "Assembly Central", recipient: "#{username}", sender_address: ENV.fetch("CENTRAL_ADDRESS_PUBLIC_ADDRESS"), recipient_address: user_public_address, btc_change: -1*amount*100000000})
    end

    def record_btc_purchase(amount)
      current_price = get_btc_spot_price_coinbase()*100
      BtcPayment.create!({btcusdprice_at_moment: current_price, created_at: DateTime.now, action: "Bought BTC", recipient: "Assembly Central Address", recipient_address: ENV.fetch("CENTRAL_ADDRESS_PUBLIC_ADDRESS"), btc_change: amount*100000000})
    end

    def record_outflow(amount, action, destination_address, datetime, who_received)
      current_price = get_btc_spot_price_coinbase()*100
      BtcPayment.create!({btcusdprice_at_moment: current_price, created_at: datetime, action: action, recipient: who_received, recipient_address: destination_address, btc_change: -100000000*amount, sender: "Assembly Central", sender_address: ENV.fetch("CENTRAL_ADDRESS_PUBLIC_ADDRESS")})
    end

  end
end
