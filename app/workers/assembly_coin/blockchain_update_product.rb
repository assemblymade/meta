module AssemblyCoin
  class BlockchainUpdateProduct < AssemblyCoin::Worker

    def perform(product)
      AssemblyCoin::MaintainBtcBalance.new.perform(product.id)

      product.assign_asset_address

      distinct_txs = product.distinct_wallets_unqueued

      distinct_txs.each do |user_id, coins|

        user = User.find(user_id)
        if user.wallet_public_address.nil?
          AssemblyCoin::AssignBitcoinKeyPairWorker.new.perform(
            user_id,
            :assign_key_pair
          )
          Rails.logger.info "ADDED KEYPAIR TO #{user.username}"
        end

        AssemblyCoin::AwardCoins.new.perform(product.id, user_id, coins)
        Rails.logger.info "[coins] Awarding #{coins.to_s} Coins for #{product.id} to #{user_id}"

      end
    end
  end
end
