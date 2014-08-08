class User::BalanceEntry < ActiveRecord::Base
  belongs_to :profit_report
  belongs_to :user

  validates :coins, presence: true
  validates :earnings, presence: true

  delegate :end_at, to: :profit_report

  def ownership
    coins / profit_report.coins.to_f
  end

  def payable_earnings
    earnings - withholding
  end
  
  def withholding
    if percentage = user.tax_info.try(:withholding)
      percentage * earnings
    else
      0
    end
  end
end