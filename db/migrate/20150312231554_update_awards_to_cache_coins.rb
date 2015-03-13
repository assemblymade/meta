class UpdateAwardsToCacheCoins < ActiveRecord::Migration
  def change
    Award.where(cents: nil).includes(:wip).find_each do |a|
      coins = 0
      if a.wip.offers.count == 0
        a.update!(cents: 0)
      else
        entries = TransactionLogEntry.
          where(product_id: a.wip.product_id, wallet_id: a.winner_id).
          where('created_at > ? and created_at < ?', a.created_at - 10, a.created_at + 10)

        if entries.any?
          a.update!(cents: entries.sum(:cents))
        end
      end
    end
  end
end
