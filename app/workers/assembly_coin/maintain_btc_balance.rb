module AssemblyCoin
  class MaintainBtcBalance < AssemblyCoin::Worker

    def perform(product_id)
      product = Product.find_by(id: product_id)
      if product.state == 'greenlit' or product.state == 'profitable'
        amount = ENV['MIN_PRODUCT_BTC'].to_f
        OpenAssets::BlockchainServer.new.create_btc_maintenance(product, amount)
      end
    end
  end
end
