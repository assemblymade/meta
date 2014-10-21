module AssemblyCoin
  class TransactionsOnBlockchain < AssemblyCoin::Worker

    def perform(product_id)
      txs_within_product = TransactionLogEntry.where(product_id: product_id, queue_id: nil)

      distinct_wallets = txs_within_product.select(:wallet_id).distinct

      distinct_wallets.each do |dw|
        wallet_id = dw.wallet_id

        if not User.find_by(id: wallet_id).nil?
          user = User.find_by(id: wallet_id)
          user_id = user.id

          if user.wallet_public_address.nil?
            user.retrieve_key_pair_sync
            puts "ADDED KEYPAIR TO #{user.username}"
          end
          user = User.find_by(id: wallet_id)

          puts wallet_id
          puts product_id
          product = Product.find_by(id: product_id)

          sumvalue = TransactionLogEntry.where(queue_id: nil, wallet_id: wallet_id, product_id: product_id).sum(:cents)

          if sumvalue>0
            puts "sending #{sumvalue} coins to #{user.username} from #{product.wallet_public_address} "
            AssemblyCoin::AwardCoins.new.perform(product_id, user_id, sumvalue)
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
