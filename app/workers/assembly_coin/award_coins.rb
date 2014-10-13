module AssemblyCoin
  class AwardCoins < AssemblyCoin::Worker

    def perform(product_id, user_id, coins)
      TransferCoins.new.transfer(product_id, user_id, coins)
    end

  end
end
