module AssemblyCoin
  class AwardCoins < AssemblyCoin::Worker

    def perform(product_id, user_id, coins)
      if coins > 0
        OpenAssets::Transactions.new.award_coins(product_id, user_id, coins)
      end
    end

  end
end
