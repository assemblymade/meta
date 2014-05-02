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

      work_stats = TransactionLogWorkStats.new(product.id, log_entry.work_id, log_entry.created_at)
      if work_stats.worker_id.nil?
        Rails.logger.info("fail=null_worker entry=#{log_entry.id}")
        return
      end

      exchange_rate = TransactionLogExchangeRate.at(product.id, log_entry.created_at)

      coins = minted_coins(exchange_rate, work_stats.upvotes, work_stats.multiplier)
      if coins <= 0
        Rails.logger.info("ignore=minting coins=#{coins} entry=#{log_entry.id}")
        return
      end

      entries = create_mint_entries!(work_stats.worker_id, coins, exchange_rate)
      entries.each do |entry|
        Rails.logger.info("minting parent=#{log_entry.id} entry=#{entry.id} action=#{entry.action} user=#{entry.user_id} coins=#{entry.value} rate=#{exchange_rate}")
      end
    end

    def create_mint_entries!(worker_id, coins, exchange_rate)
      TransactionLogEntry.transaction do
        transaction_id = SecureRandom.uuid

        total_tip = 0
        tip_entries = AutoTipContract.active_at(product, log_entry.created_at).map do |contract|
          tip = contract.amount * coins
          total_tip += tip

          TransactionLogEntry.minted!(
            transaction_id,
            log_entry.created_at,
            product,
            log_entry.work_id,
            contract.user_id,
            tip * 100,
            tip: contract.amount
          )
        end

        main_entry = TransactionLogEntry.minted!(
          transaction_id,
          log_entry.created_at,
          product,
          log_entry.work_id,
          worker_id,
          (coins - total_tip) * 100,
          rate: exchange_rate
        )

        tip_entries + [main_entry]
      end
    end

    def minted_coins(exchange_rate, upvotes, multiplier)
      case log_entry.action
        when 'voted'
          # mint coins based on this vote
          exchange_rate * log_entry.value.to_d * multiplier

        when 'validated'
          # mint coins based on all previous upvotes
          exchange_rate * upvotes * multiplier.to_d
      end
    end
  end
end
