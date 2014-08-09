class Offer < ActiveRecord::Base
  belongs_to :user
  belongs_to :bounty, class_name: 'Wip', foreign_key: "bounty_id", inverse_of: :offers

  validates :user, presence: true
  validates :bounty, presence: true
  validates :amount, presence: true, numericality: {
    only_integer: true,
    greater_than_or_equal_to: 0
  }

  delegate :product, to: :bounty

  def influence
    partner = Partner.new(self.product, self.user)
    [partner.coins, partner.ownership, partner.total_coins]

    inf = if partner.coins.zero?
      1
    else
      partner.coins
    end

    inf / partner.total_coins.to_f
  end

end
