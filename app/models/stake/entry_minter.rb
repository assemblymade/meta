module Stake
  # Takes an entry in the transaction log and mints associated coins
  class EntryMinter
    attr_reader :product, :log_entry

    def initialize(product, log_entry)
      @product = product
      @log_entry = log_entry
    end

    # if the current transaction log entry is a coin minting event
    # add a minted entry with the coin value
    def mint_coins!
      # only validated and voted actions actually mint coins
      return unless %w(validated voted).include? log_entry.action

      # only one mint entry per validation/voting entry
      if entry = TransactionLogEntry.minted.find_by(transaction_id: log_entry.id)
        return entry
      end

      work_stats = TransactionLogWorkStats.new(product.id, log_entry.work_id, log_entry.created_at)
      if !work_stats.validated?
        Rails.logger.info("ignore=minting fail=work_not_validated")
        return
      end

      if work_stats.worker_id.nil?
        Rails.logger.info("ignore=minting fail=null_worker entry=#{log_entry.id}")
        return
      end

      exchange_rate = TransactionLogExchangeRate.at(product.id, log_entry.created_at)
      cents = minted_cents(exchange_rate, work_stats.upvotes, work_stats.multiplier)
      unless cents > 0
        Rails.logger.info("ignore=minting fail=no_cents entry=#{log_entry.id} rate=#{exchange_rate} upvotes=#{work_stats.upvotes} multiplier=#{work_stats.multiplier}")
        return
      end

      TransactionLogEntry.minted!(
        log_entry.id,
        log_entry.created_at,
        product,
        log_entry.work_id,
        log_entry.work_id,
        cents,
        rate: exchange_rate
      ).tap do |entry|
        Rails.logger.info("minting parent=#{log_entry.id} entry=#{entry.id} action=#{entry.action} wallet=#{entry.wallet_id} cents=#{cents} rate=#{exchange_rate}")
      end
    end

    def minted_cents(exchange_rate, upvotes, multiplier)
      case log_entry.action
        when 'voted'
          # mint cents based on this vote
          exchange_rate * log_entry.value.to_d * multiplier * 100

        when 'validated'
          # mint cents based on all previous upvotes
          exchange_rate * upvotes * multiplier.to_d * 100
      end
    end
  end
end
