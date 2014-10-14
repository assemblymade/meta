module AssemblyCoin
  class SendBtc < AssemblyCoin::Worker

    def perform(product_id)

      product = Product.find(product_id)
      destination = product.wallet_public_address

      current_btc=GetBtcBalance.new.get_btc_balance(destination)
      current_time =  Time.now.getutc

      time_since_last_checked = current_time - product.last_checked_btc

      if ENV['MIN_PRODUCT_BTC'] > current_btc and time_since_last_checked > 3600 then
        amount = ENV['MIN_PRODUCT_BTC'] - current_btc

        product.update(last_checked_btc: current_time)

        Transactions.new.send_btc(public_address, destination, private_key, amount)
      end
    end
  end
end
