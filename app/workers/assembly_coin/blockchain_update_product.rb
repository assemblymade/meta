module AssemblyCoin
  class BlockchainUpdateProduct < AssemblyCoin::Worker

    def perform(product)
      AssemblyCoin::MaintainBtcBalance.new.perform(product.id)
      distinct_txs = TransactionLogEntry.where(action: 'credit', product_id: product.id, queue_id: nil).select(:transaction_id).distinct
      distinct_txs.each do |distinct_tx|

      #DETERMINE IF THIS WAS AWARDED FROM BOUNTY OR TIP FROM USER, look at corresponding debit tx
        debit_tx = TransactionLogEntry.where(action: 'debit', transaction_id: distinct_tx.transaction_id, queue_id: nil).first

        if not debit_tx.nil?  #IT SHOULD NEVER BE NIL BUT CHECKING ANYWAY
          sender_id = debit_tx.wallet_id

          if User.find_by(id: sender_id).nil?  #NOT A USER DEBIT, WAS NOT A TIP,   WAS AWARDED FROM BOUNTY (send coins directly from product address)
            award_transaction_entry = TransactionLogEntry.where(transaction_id: distinct_tx.transaction_id, queue_id: nil, action: 'credit').first
            receiver_id = award_transaction_entry.wallet_id
            sumvalue = award_transaction_entry.cents.to_i
            product_id =  award_transaction_entry.product_id
            receiver = User.find_by(id: receiver_id)

            if not receiver.nil? and sumvalue > 0
              if receiver.wallet_public_address.nil?
                AssemblyCoin::AssignBitcoinKeyPairWorker.new.perform(
                  receiver.to_global_id,
                  :assign_key_pair
                )
                Rails.logger.info "ADDED KEYPAIR TO #{receiver.username}"
              end

              AssemblyCoin::AwardCoins.new.perform(product_id, receiver_id, sumvalue)
              Rails.logger.info "[coins] Awarding #{sumvalue.to_s} Coins for #{product_id} to #{receiver_id}"
              award_transaction_entry.update!(queue_id: Time.now.to_s)
            end
          end
        end
      end
    end
  end
end
