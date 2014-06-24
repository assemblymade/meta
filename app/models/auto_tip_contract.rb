class AutoTipContract < ActiveRecord::Base
  DEFAULT_SPLIT = 0.05

  belongs_to :product, touch: true
  belongs_to :user

  scope :active_at, -> (product, at) { where(product_id: product.id).where('created_at <= ? and (deleted_at is null or deleted_at > ?)', at, at) }

  before_validation :truncate_amount

  validate :one_contract_per_user

  def active?
    deleted_at.nil?
  end


  # the minimum autotip is 0.001
  def truncate_amount
    self.amount = (self.amount * 1000).floor / 1000.0
  end

  def one_contract_per_user
    if AutoTipContract.active_at(product, (created_at || Time.now)).where(user_id: user.id).exists?
      errors.add(:user, "existing contract in place for user")
    end
  end

  def self.replace_contracts_with_default_core_team_split(product, start_at = Time.now)
    user_amounts = product.core_team.inject({}) {|h, u| h[u] = DEFAULT_SPLIT/product.core_team.size.to_f; h }
    replace_contracts(product, user_amounts, start_at)
  end

  def self.replace_contracts(product, user_amounts, start_at = Time.now)
    AutoTipContract.transaction do
      end_at = start_at - 1
      AutoTipContract.active_at(product, Time.now).update_all deleted_at: end_at

      user_amounts.each do |user, amount|
        AutoTipContract.create! product: product, user: user, amount: amount
      end
    end
  end
end
