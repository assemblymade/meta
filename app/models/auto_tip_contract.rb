class AutoTipContract < ActiveRecord::Base
  belongs_to :product
  belongs_to :user

  scope :active_at, -> (product, at) { where(product_id: product.id).where('created_at <= ? and (deleted_at is null or deleted_at > ?)', at, at) }

  before_validation :truncate_amount

  validate :one_contract_per_user

  # the minimum autotip is 0.001
  def truncate_amount
    self.amount = (self.amount * 1000).floor / 1000.0
  end

  def one_contract_per_user
    if AutoTipContract.active_at(product, (created_at || Time.now)).where(user_id: user.id).exists?
      errors.add(:user, "existing contract in place for user")
    end
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
