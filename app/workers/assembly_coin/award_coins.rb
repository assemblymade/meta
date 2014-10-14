module AssemblyCoin
  class AwardCoins < AssemblyCoin::Worker

    def perform(product_id, user_id, coins)
      Transactions.new.award_coins(product_id, user_id, coins)
    end

  end
end
