class UpdateAwardsToCacheCoins < ActiveRecord::Migration
  def up
    grouped = {}
    Award.find_each do |a|
      key = "#{a.winner_id}-#{a.wip_id}-#{a.created_at}"
      grouped[key] ||= []
      grouped[key] << a
    end

    dupes = grouped.select{|k,v| v.size > 1 }
    dupes.each do |k,v|
      v[1].destroy
    end

    Award.where(cents: [nil, 0]).includes(:wip).find_each do |a|
      coins = 0
      if a.wip.offers.count == 0
        a.update!(cents: 0)
      else
        entries = TransactionLogEntry.
          where(work_id: a.wip.id, wallet_id: a.winner_id)

        if !entries.any? || entries.sum(:cents) == 0
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
