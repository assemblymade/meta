class UpdateAwardsToCacheCoins < ActiveRecord::Migration
  def up
    Award.where(cents: [nil, 0]).includes(:wip).find_each do |a|
      coins = 0
      if a.wip.offers.count == 0
        a.update!(cents: 0)
      else
        entries = TransactionLogEntry.
          where(work_id: a.wip.id, wallet_id: a.winner_id)

        if !entries.any?
          entries = TransactionLogEntry.
            where(product_id: a.wip.product_id, wallet_id: a.winner_id).
            where('created_at > ? and created_at < ?', a.created_at - 10, a.created_at + 10)
        end

        if entries.any?
          a.update!(cents: entries.sum(:cents))
        end
      end
    end
  end
end
