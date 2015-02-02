class Offer < ActiveRecord::Base
  belongs_to :user
  belongs_to :bounty, class_name: 'Wip', foreign_key: "bounty_id", inverse_of: :offers, touch: true

  validates :user, presence: true
  validates :bounty, presence: true
  validates :amount, presence: true, numericality: {
    only_integer: true,
    greater_than_or_equal_to: 0
  }

  validate :reasonable_value

  delegate :product, to: :bounty

  after_commit -> { bounty.update_coins_cache! }

  default_scope -> { joins(:user).where(users: {deleted_at: nil}) }

  def influence
    partner = Partner.new(self.product, self.user)

    return 0 if partner.total_coins.zero?

    [partner.coins, 1].max / partner.total_coins.to_f
  end

  def earnable
    amount - (bounty.contracts.tip_percentage * amount)
  end

  def earnable=(earnable_amount)
    self.amount = (earnable_amount / (1 - bounty.contracts.tip_percentage)).round.to_i
  end

  def reasonable_value
    return if bounty.product.core_team?(user) || bounty.offers.empty?

    if earnable > average_offer * 100
      errors.add(amount, 'must be within reason')
    end
  end

  def average_offer
    amounts = bounty.active_offers.map(&:amount)
    amounts.sum / amounts.size
  end

end
