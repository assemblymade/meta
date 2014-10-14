module AssemblyCoin
  class CreateCoin < AssemblyCoin::Worker

    def perform(product_id, total_coins)
        Transactions.new.forge_coins(product_id, total_coins)
    end

  end
end
