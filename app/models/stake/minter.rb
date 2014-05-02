module Stake
  class Minter
    attr_reader :product

    def initialize(product)
      @product = product
    end

    # if the current transaction log entry is a coin minting event
    # add a minted entry with the coin value
    def mint_coins!(minting_entry)
      # only validated on voted actions actually mint coins
      return unless %w(validated voted).include? minting_entry.action

      work_id = minting_entry.work_id
      info = replay_history_extract_minting_info(work_id, minting_entry.created_at)

      if info[:worker_id].nil?
        Rails.logger.info("fail=null_worker entry=#{minting_entry.id}")
        return
      end

      exchange_rate = exchange_rate_at(minting_entry.created_at)

      coins = case minting_entry.action
      when 'voted'
        # mint coins based on this vote
        exchange_rate * minting_entry.value.to_d * info[:multiplier]

      when 'validated'
        # mint coins based on collected upvotes
        exchange_rate * info[:upvotes] * info[:multiplier].to_d
      end

      if coins <= 0
        Rails.logger.info("ignore=minting coins=#{coins} entry=#{minting_entry.id}")
        return
      end

      TransactionLogEntry.transaction do
        transaction_id = SecureRandom.uuid

        total_tip = 0
        tip_entries = AutoTipContract.active_at(product, minting_entry.created_at).map do |contract|
          tip = contract.amount * coins
          total_tip += tip

          TransactionLogEntry.minted!(
            transaction_id,
            minting_entry.created_at,
            product,
            work_id,
            contract.user_id,
            tip * 100,
            tip: contract.amount
          )
        end

        main_entry = TransactionLogEntry.minted!(
          transaction_id,
          minting_entry.created_at,
          product,
          work_id,
          info[:worker_id],
          (coins - total_tip) * 100,
          rate: exchange_rate
        )

        (tip_entries + [main_entry]).tap do |entries|
          entries.each do |entry|
            Rails.logger.info("queuing=coin_update parent=#{minting_entry.id} entry=#{entry.id} action=#{entry.action} user=#{entry.user_id} coins=#{entry.value} rate=#{exchange_rate}")
          end
        end
      end
    end

    def exchange_rate_at(at)
      votes = collect_votes_earned(at)
      Stake::ExchangeCalculatorV1.new.rate_at(votes, votes.last)
    end

    def replay_history_extract_minting_info(work_id, end_at)
      # replay the entire history to how many upvotes the
      # work item has collected and who completed it
      upvotes = 0
      rate = nil
      worker_id = nil
      multiplier = 1
      TransactionLogEntry.where(product_id: product.id).
                          where('created_at <= ?', end_at).order(:created_at).each do |entry|
        if entry.work_id == work_id
          case entry.action
          when 'voted'
            # count upvotes for the piece of work we're interested in
            upvotes += entry.value.to_i

          when 'validated'
            # extract the worker_id from the validated event
            worker_id = entry.value

          when 'multiplied'
            multiplier = entry.value.to_i
          end
        end
      end

      {
        upvotes: upvotes,
        worker_id: worker_id,
        multiplier: multiplier
      }
    end

    def collect_votes_earned(end_at)
      votes = []
      work = {}
      TransactionLogEntry.where(product_id: product.id).where('created_at <= ?', end_at).order(:created_at).each do |entry|
        time = entry.created_at
        work_id = entry.work_id
        value = entry.value

        work[work_id] ||= { state: 'proposed', upvotes: 0 }

        case entry.action
        when 'voted'
          work[work_id][:upvotes] += value.to_i
          if work[work_id][:state] == 'validated'
            votes.push(time)
          end
        when 'validated'
          if work[work_id].nil?
            work[work_id] = { state: 'validated', upvotes: 0, worker: value }
          elsif work[work_id][:state] == 'proposed'
            work[work_id][:state] = 'validated'
            work[work_id][:worker] = value
            work[work_id][:upvotes].times do
              votes.push(time)
            end
          end
        end
      end
      votes
    end
  end
end
