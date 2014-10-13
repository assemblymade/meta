module AssemblyCoin
  class CreateCoin < AssemblyCoin::Worker

    def perform(product_id, total_coins)
        CreateCoins.new.forgecoins(product_id, total_coins)
    end

  end
end
