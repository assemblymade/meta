class MinterWorker < ActiveJob::Base
  queue_as :critical

  def perform(transaction_log_entry_id)
    entry = TransactionLogEntry.find(transaction_log_entry_id)

    if minting = Stake::EntryMinter.new(entry.product, entry).mint_coins!
      CoinsMinted.enqueue(minting.id)
    end
  end
end
