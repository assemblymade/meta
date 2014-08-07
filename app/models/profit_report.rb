class ProfitReport < ActiveRecord::Base
  belongs_to :product, touch: true
  has_many :user_balances, class_name: User::BalanceEntry.to_s

  validates :annuity, presence: :true
  validates :coins, presence: :true
  validates :end_at, presence: :true
  validates :expenses, presence: :true
  validates :revenue, presence: :true

  before_validation :set_coins

  FEE = 0.10

  def profit
    revenue - expenses
  end

  def earnable
    profit_post_annuity * (1 - FEE)
  end

  def payable_annuity
    [profit, annuity].min
  end

  def profit_post_annuity
    [profit - annuity, 0].max
  end

  def fee
    FEE * profit_post_annuity
  end

  def payable
    user_balances.joins(:user).where('users.is_staff is false').sum(:earnings)
  end

  def royalty
    earnable / coins.to_f
  end

  # private

  def set_coins
    self.coins = TransactionLogEntry.to_month_end(end_at).where(product: product).in_user_wallets.sum(:cents)
  end
end