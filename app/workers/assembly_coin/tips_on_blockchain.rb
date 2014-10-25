module AssemblyCoin
  class TipsOnBlockchain < AssemblyCoin::Worker

    def perform

      Product.where(state: ['greenlit', 'profitable']).each do |product|
        product_id = product.id
        tip_transaction_ids = TransactionLogEntry.where(action: ['credit', 'debit'], product_id: product_id, queue_id: nil).select('transaction_id').distinct

        tip_transaction_ids.each do |tx|
          sender = TransactionLogEntry.where(transaction_id: tx, "cents < 0").wallet_id
          receiver = TransactionLogEntry.where(transaction_id: tx, "cents>0").wallet_id  #there should never be more than 1 result
          coins = TransactionLogEntry.where(transaction_id: tx).cents

          if not User.find_by(id: sender).nil? and not User.find_by(id: receiver).nil?
              OpenAssets::transfer_coins(sender, receiver, coins, product)
          end
        end
      end
    end
  end
end
