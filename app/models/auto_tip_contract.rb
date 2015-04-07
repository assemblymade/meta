class AutoTipContract < ActiveRecord::Base
  DEFAULT_SPLIT = 0.05

  belongs_to :product, touch: true
  belongs_to :user

  scope :active_at, -> (product, at) { where(product_id: product.id).active }
  scope :active, -> (at=Time.now) { where('created_at <= ? and (deleted_at is null or deleted_at > ?)', at, at) }

  before_validation :truncate_amount

  validate :one_contract_per_user
  validate :contracts_less_than_100_percent

  validates :amount, presence: true, numericality: {
    greater_than_or_equal_to: 0
  }

  alias_attribute :percentage, :amount

  def active?
    deleted_at.nil?
  end

  # the minimum autotip is 0.001
  def truncate_amount
    self.amount = (self.amount * 1000).floor / 1000.0
  end

  def self.active_tip_contracts_on_product(product)
    product.auto_tip_contracts.select{|a| a.active?}.map{|b| AutoTipContractSerializer.new(b)}
  end

  def self.closed_tip_contracts_on_product(product)
    product.auto_tip_contracts.select{|a| !a.active?}.map{|b| AutoTipContractSerializer.new(b)}
  end

  def one_contract_per_user
    if AutoTipContract.active_at(product, (created_at || Time.now)).where(user_id: user.id).exists?
      errors.add(:user, "existing contract in place for user")
    end
  end

  def contracts_less_than_100_percent
    total = AutoTipContract.where(product_id: product.id, deleted_at: nil).inject(0) do |memo, contract|
      memo + contract.amount
    end

    if total > 1
      errors.add(:product, "contracts exceed 100%")
    end
  end

  def self.end_contract(product, user)
    end_at = Time.now - 1
    AutoTipContract.transaction do
      AutoTipContract.active_at(product, Time.now).where(user: user).update_all deleted_at: end_at
    end
  end

  def self.replace_contract(product, user, amount, start_at = Time.now)
    AutoTipContract.transaction do
      AutoTipContract.end_contract(product, user)

      AutoTipContract.create! product: product, user: user, amount: amount
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
