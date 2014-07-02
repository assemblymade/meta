class MinterWorker
  include Sidekiq::Worker
  sidekiq_options queue: 'critical'

  def perform(transaction_log_entry_id)
    entry = TransactionLogEntry.find(transaction_log_entry_id)

    if minting = Stake::EntryMinter.new(entry.product, entry).mint_coins!
      CoinsMinted.perform_async(minting.id)
    end
  end
end
