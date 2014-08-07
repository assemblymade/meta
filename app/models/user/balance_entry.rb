class User::BalanceEntry < ActiveRecord::Base
  belongs_to :profit_report
  belongs_to :user

  validates :coins, presence: true
  validates :earnings, presence: true

  def created_at
    profit_report.end_at.to_time
  end

  def ownership
    coins / profit_report.coins.to_f
  end
end