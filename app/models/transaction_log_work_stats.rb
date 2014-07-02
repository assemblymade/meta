class TransactionLogWorkStats
  attr_reader :upvotes, :worker_id, :multiplier

  def initialize(product_id, work_id, end_at)
    replay_history_extract_minting_info(product_id, work_id, end_at)
  end

  def replay_history_extract_minting_info(product_id, work_id, end_at)
    # replay the entire history to how many upvotes the
    # work item has collected and who completed it
    @upvotes = 0
    @worker_id = nil
    @multiplier = 1
    @validated = false
    
    TransactionLogEntry.where(product_id: product_id).
                        where('created_at <= ?', end_at).order(:created_at).each do |entry|
      if entry.work_id == work_id
        case entry.action
        when 'voted'
          # count upvotes for the piece of work we're interested in
          @upvotes += entry.value.to_i

        when 'validated'
          # extract the worker_id from the validated event
          @worker_id = entry.value
          @validated = true

        when 'multiplied'
          @multiplier = entry.value.to_i
        end
      end
    end
  end
  
  def validated?
    @validated
  end
end