module AssemblyCoin
  class TransactionsOnBlockchain < AssemblyCoin::Worker

    def perform(product_id)
      product = Product.find(product_id)

      distinct_wallets = TransactionLogEntry.
        where(action: 'credit', product_id: product_id, queue_id: nil).
        select(:wallet_id).
        distinct.to_a

      distinct_wallets.each do |dw|
        wallet_id = dw.wallet_id

        if user = User.find_by(id: wallet_id)
          if user.wallet_public_address.nil?
            AssemblyCoin::AssignBitcoinKeyPairWorker.new.perform(
              user.to_global_id,
              :assign_key_pair
            )
            Rails.logger.info "ADDED KEYPAIR TO #{user.username}"
          end

          sumvalue = TransactionLogEntry.where(queue_id: nil, wallet_id: wallet_id, product_id: product_id).sum(:cents)

          if sumvalue > 0
            Rails.logger.info "sending #{sumvalue} coins to #{user.username} from #{product.wallet_public_address}"
            AssemblyCoin::AwardCoins.new.perform(product_id, user.id, sumvalue)
          end

          ids = TransactionLogEntry.where(wallet_id: wallet_id, product_id: product_id, queue_id: nil)
          ids.each do |id|
            TransactionLogEntry.find_by(id: id).update!(queue_id: Time.now.to_s)
          end
        end
      end
    end
  end
end
