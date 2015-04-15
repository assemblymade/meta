module AssemblyCoin
  class CreateCoin < AssemblyCoin::Worker

    def perform(product_id, total_coins)
      product = Product.find_by(id: product_id)
      if not product.nil?
        state = product.state
        if state == 'greenlit' || state == 'profitable'
          OpenAssets::Transactions.new.forge_coins(product_id, total_coins)
          product.update!(issued_coins: Time.now)
        else
          Rails.logger.info "[coins] Coin Not Created: Only Greenlit or Profitable Products allowed"
        end
      else
        Rails.logger.info "[coins] Product Not Found"
      end
    end
  end
end
