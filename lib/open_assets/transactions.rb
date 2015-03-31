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
        amount: amount
      }

      current_price = get_btc_spot_price_coinbase()*100
      sender = "Assembly Central"
      recipient = destination
      sender_address = public_address
      recipient_address = destination
      BtcPayment.create!({btcusdprice_at_moment: current_price, created_at: DateTime.now, action: "Sent BTC", sender: sender, recipient: recipient, sender_address: sender_address, recipient_address: recipient_address, btc_change: amount*-100000000})

      remote = OpenAssets::Remote.new("http://coins.assembly.com")
      end_url="v2/btc/transfer"
      remote.post end_url, params.to_json
    end

    def forge_coins(product_id, total_coins)
      product = Product.find(product_id)

      body = {
        public_address: product.wallet_public_address,
        private_key: product.wallet_private_key,
        name: product.name,
        metadata: "assembly.com/#{product.slug}/coin",
        coins: total_coins
      }

      puts "Forging #{total_coins}  #{product.name} Coins for #{product.wallet_public_address}"

      remote = OpenAssets::Remote.new("http://coins.assembly.com")
      end_url="v2/colors/issue"
      remote.post end_url, body.to_json
    end


    def award_coins(product_id, user_id, coins)
      product = Product.find(product_id)
      user = User.find(user_id)

      body = {
        public_address: product.wallet_public_address,
        recipient_address: user.wallet_public_address,
        private_key: product.wallet_private_key,
        amount: coins.to_s,
        asset_address: product.coin_info.asset_address.to_s
      }

      remote = OpenAssets::Remote.new("http://coins.assembly.com")
      end_url="v2/colors/transfer"
      remote.post end_url, body.to_json
    end

    def get_asset_address(btc_address)
      url = "http://coins.assembly.com"
      remote = OpenAssets::Remote.new(url)
      end_url = "/v2/colors/asset_address/#{btc_address}"

      asset_address = remote.get end_url
    end

    def get_btc_pair()
      url = "https://coins.assembly.com"
      remote = OpenAssets::Remote.new(url)
      end_url="/v2/addresses"

      pair = remote.get end_url
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
      BtcPayment.where('created_at < ?', date).where('created_at > ?', date-1.month).where('btc_change > 0').sum('btc_change*btcusdprice_at_moment').to_f / 10000000000
    end

    def btc_dollar_value(date)
      btc_assets_as_of_date(date).to_f*historical_price(date) / 100000000
    end

    def dollar_outflows_as_btc(date)
      BtcPayment.where('created_at < ?', date).where('btc_change < 0').sum('btc_change*-1*btcusdprice_at_moment').to_f/10000000000
    end

    def dollar_outflows_as_btc_per_month(date)
      BtcPayment.where('created_at < ?', date).where('created_at > ?', date-1.month).where('btc_change < 0').sum('btc_change*-1*btcusdprice_at_moment').to_f/10000000000
    end

    def average_bought_price_as_of_date(date)
      sum = 0
      btcsum = 0
      BtcPayment.where('created_at < ?', date).each do |b|
        if b.action == "Bought BTC"
          sum = sum + b.btc_change * b.btcusdprice_at_moment.to_f / 100
          btcsum = btcsum + b.btc_change
        end
      end
      if btcsum != 0
        return sum.to_f / btcsum.to_f
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
