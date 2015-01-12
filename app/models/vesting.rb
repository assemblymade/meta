class Vesting < ActiveRecord::Base
  belongs_to :proposal, polymorphic: true

  def payout
    coins_each = self.coins / self.intervals
    to_id = self.user_id
    cents =
    via =
    from_id = 
    TransactionLogEntry.transfer!(self.product, from_id, to_id, cents, via, created_at=Time.now)
  end

end
