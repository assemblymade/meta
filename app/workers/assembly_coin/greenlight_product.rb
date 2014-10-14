module AssemblyCoin
  class GreenlightProduct < AssemblyCoin::Worker

    TOTAL_COINS_UPON_GREENLIGHT = 10_000_000

    def perform(product_id)
      AssemblyCoin::SendBtc.new.perform_async(product_id)

      product = Product.find(product_id)

      if not product.issued_coins then
        AssemblyCoin::CreateCoin.new.perform_async(product_id, TOTAL_COINS_UPON_GREENLIGHT)
      end

    end

  end
end
