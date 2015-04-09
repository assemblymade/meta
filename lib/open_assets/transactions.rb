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
        recipient_address: destination,
        private_key: private_key,
        amount: amount,
        identifier: destination+":"+amount.to_s+":"+DateTime.now.to_s
      }

      BtcPayment.create!({
        btcusdprice_at_moment: get_btc_spot_price_coinbase()*100,
        created_at: DateTime.now,
        action: "Sent BTC",
        sender: "Assembly Central",
        recipient: destination,
        sender_address: public_address,
        recipient_address: destination,
        btc_change: amount*-100000000})

        send_btc_request(params)
    end

    def send_btc_request(params)
      remote = OpenAssets::Remote.new("http://coins.assembly.com")
      end_url="btc/transfer"
      remote.post end_url, params.to_json
    end

    def forge_coins(product_id, total_coins)
      product = Product.find(product_id)

      body = {
        public_address: product.wallet_public_address,
        private_key: product.wallet_private_key,
        name: product.name,
        metadata: "u=https://assembly.com/#{product.slug}/coin",
        coins: total_coins,
        identifier: product_id.to_s+":"+DateTime.now.to_s
      }

      puts "Forging #{total_coins}  #{product.name} Coins for #{product.wallet_public_address}"

      remote = OpenAssets::Remote.new("http://coins.assembly.com")
      end_url="colors/issue"
      remote.post end_url, body.to_json
    end

    def verify_receiver_address_exists(user)
      receiver_address = user.wallet_public_address

      if receiver_address.nil?
        AssemblyCoin::AssignBitcoinKeyPairWorker.new.perform(
          user.to_global_id,
          :assign_key_pair
        )
        Rails.logger.info "ADDED KEYPAIR TO #{user.username}"
        receiver_address = user.wallet_public_address
      end
      receiver_address
    end

    def construct_issuing_post_body_to_product(product, user_id)
      body = {
        public_address: product.wallet_public_address,
        private_key: product.wallet_private_key,
        name: product.name,
        metadata: "u=https://assembly.com/#{product.slug}/coin",
        coins: coins,
        identifier: product_id.to_s+":"+user_id.to_s+":"+DateTime.now.to_s
      }
      body
    end

    def construct_transfer_post_body_to_user(product, user, coins, asset_address)
      body = {
        public_address: product.wallet_public_address,
        recipient_address: user.wallet_public_address,
        private_key: product.wallet_private_key,
        amount: coins.to_s,
        asset_address: asset_address,
        identifier: product.id.to_s+":"+user.id.to_s+":"+DateTime.now.to_s
      }
      body
    end

    def construct_transfer_post_user_to_product(user, product, coins, asset_address)
      body = {
        public_address: user.wallet_public_address,
        recipient_address: product.wallet_public_address,
        private_key: user.wallet_private_key,
        amount: coins.to_s,
        asset_address: asset_address,
        identifier: user.id.to_s+":"+product.id.to_s+":"+DateTime.now.to_s
      }
      body
    end

    def award_by_creating_coins(product_id, user_id, coins)
      product = Product.find(product_id)
      user = User.find(user_id)
      receiver_address = verify_receiver_address_exists(user)

      if receiver_address
        body = construct_issuing_post_body(product, user_id)
        puts "Forging #{total_coins}  #{product.name} Coins for User #{user.username} at #{user.wallet_public_address}"
        remote = OpenAssets::Remote.new("http://coins.assembly.com")
        end_url="colors/issue"
        remote.post end_url, body.to_json
      end
    end

    def award_coins(product_id, user_id, coins)
      product = Product.find(product_id)
      user = User.find(user_id)
      if product.coin_info
        asset_address = product.coin_info.asset_address.to_s
      else
        asset_address = ""
      end
      receiver_address = verify_receiver_address_exists(user)

      if receiver_address
        body = construct_transfer_post_body_to_user(product, user, coins, asset_address)
        send_post_to_transfer_route(body)
      end
    end

    def send_post_to_transfer_route(body)
      remote = OpenAssets::Remote.new("http://coins.assembly.com")
      end_url="colors/transfer"
      remote.post end_url, body.to_json
    end

    def return_coins_to_product_address(user, product, coins)
      if product.coin_info
        if asset_address = product.coin_info.asset_address
          body = construct_transfer_post_user_to_product(user, product, coins, asset_address)
          send_post_to_transfer_route(body)
        end
      end
    end

    def get_asset_address(btc_address)
      url = "http://coins.assembly.com"
      remote = OpenAssets::Remote.new(url)
      end_url = "/colors/asset_address/#{btc_address}"

      asset_address = remote.get end_url
    end

    def get_btc_spot_price_coinbase()
      url = "https://coinbase.com"
      remote = OpenAssets::Remote.new(url)
      end_url = "/api/v1/prices/spot_rate"
      price = remote.get end_url
      price = price['amount'].to_f
    end

    def historical_price(date)
      date.strftime('%a %b %d %H:%M:%S %Z %Y')
      datestring = date.strftime("%Y-%m-%d")
      url = "https://api.coindesk.com"
      remote = OpenAssets::Remote.new(url)
      end_url = "/v1/bpi/historical/close.json?start=#{datestring}"
      puts end_url
      price = remote.get end_url
      price = JSON.parse(price)['bpi'].first[1]
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

    def btc_assets_as_of_date(date)
      BtcPayment.where('created_at < ?', date).sum(:btc_change).to_f/100000000
    end

    def dollars_spent_on_btc(date)
      BtcPayment.where('created_at < ?', date).where('btc_change > 0').sum('btc_change*btcusdprice_at_moment').to_f / 10000000000
    end

    def dollars_spent_on_btc_per_month(date)
      payments_between_dates = BtcPayment.payments_before_data(data).where('created_at > ?', date-1.month)
      payments_between_dates.where('btc_change > 0').sum('btc_change*btcusdprice_at_moment').to_f / 10000000000
    end

    def btc_dollar_value(date)
      btc_assets_as_of_date(date).to_f*historical_price(date) / 100000000
    end

    def dollar_outflows_as_btc(date)
      BtcPayment.payments_before_data(date).where('btc_change < 0').sum('btc_change*-1*btcusdprice_at_moment').to_f/10000000000
    end

    def dollar_outflows_as_btc_per_month(date)
      BtcPayment.payments_before_data(data).where('created_at > ?', date-1.month).where('btc_change < 0').sum('btc_change*-1*btcusdprice_at_moment').to_f/10000000000
    end

    def average_bought_price_as_of_date(date)
      sum = 0
      btcsum = 0
      buy_payments_before_date = BtcPayment.where('created_at < ?', date).select{|a| a.action == "Bought BTC"}
      sum_usd_value_change = buy_payments_before_date.sum("btc_change * btc_usdprice_at_moment / 100.0")
      sum_btc_value_change = buy_payments_before_date.sum("btc_change")

      if sum_btc_value_change != 0
        return sum_usd_value_change.to_f / sum_btc_value_change.to_f
      else
        return 0
      end
    end

    def gainloss(date)
      btc_dollar_value(date) + dollar_outflows_as_btc(date) - dollars_spent_on_btc(date)
    end

    def gainloss_for_month(date)
      lastdate = date - 1.month
      gainloss(date) - gainloss(lastdate)
    end

  end
end
