class TransactionLogExchangeRate
  def self.at(product_id, end_at)
    votes = collect_votes_earned(product_id, end_at)
    Stake::ExchangeCalculatorV1.new.rate_at(votes, votes.last)
  end

  def self.collect_votes_earned(product_id, end_at)
    votes = []
    work = {}
    TransactionLogEntry.where(product_id: product_id).where('created_at <= ?', end_at).order(:created_at).each do |entry|
      time =
      work_id = entry.work_id
      value = entry.value

      work[work_id] ||= { state: 'proposed', upvotes: 0 }

      case entry.action
      when 'voted'
        work[work_id][:upvotes] += value.to_i
        if work[work_id][:state] == 'validated'
          votes.push(entry.created_at)
        end
      when 'validated'
        if work[work_id].nil?
          work[work_id] = { state: 'validated', upvotes: 0, worker: value }
        elsif work[work_id][:state] == 'proposed'
          work[work_id][:state] = 'validated'
          work[work_id][:worker] = value
          work[work_id][:upvotes].times do
            votes.push(entry.created_at)
          end
        end
      end
    end
    votes
  end
end