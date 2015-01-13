class Vesting < ActiveRecord::Base
  belongs_to :proposal
  belongs_to :product
  belongs_to :user

  def payout
    coins_each = self.coins / self.intervals
    to_id = self.user_id
    product = self.proposal.product

    TransactionLogEntry.minted!(
      SecureRandom.uuid,
      Time.now,
      product,
      to_id,
      coins_each,
      comment: 'vesting schedule'
    )
  end

  def check_for_payout
  end


end
