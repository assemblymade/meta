class MinterWorker
  include Sidekiq::Worker

  def perform(transaction_log_entry_id)
    entry = TransactionLogEntry.find(transaction_log_entry_id)
    logger.info("action=#{entry.action} entry=#{entry.id} value=#{entry.value}")

    Stake::Minter.new(entry.product).mint_coins!(entry)
  end
end
