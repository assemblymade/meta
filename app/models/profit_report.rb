class ProfitReport < ActiveRecord::Base
  belongs_to :product, touch: true
  has_many :user_balances, class_name: User::BalanceEntry.to_s

  validates :annuity, presence: :true
  validates :coins, presence: :true
  validates :end_at, presence: :true
  validates :expenses, presence: :true
  validates :revenue, presence: :true

  FEE = 0.10

  def profit
    revenue - expenses
  end

  def earnable
    (profit - annuity) * (1 - FEE)
  end

  def fee
    FEE * (profit - annuity)
  end

  def payable
    user_balances.joins(:user).where('users.is_staff is false').sum(:earnings)
  end
end