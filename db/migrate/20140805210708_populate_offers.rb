class PopulateOffers < ActiveRecord::Migration
  def up
    Vote.where(voteable_type: 'Wip').each do |vote|
      wip = vote.voteable

      amount = if wip.awarded?
        TransactionLogEntry.where(work_id: wip.id).sum(:cents)
      else
        exchange_rate = TransactionLogExchangeRate.at(wip.product_id, Time.now)
        score = wip.score || 0
        exchange_rate * score * 100
      end.to_i

      offer = Offer.new(
        bounty_id:  wip.id,
        user_id:    vote.user_id,
        amount:     amount,
        created_at: vote.created_at
      )

      begin
        offer.save!
      rescue => e
        p e
        p offer
        raise e
      end
    end
  end

  def down
    Offer.delete_all
  end
end
