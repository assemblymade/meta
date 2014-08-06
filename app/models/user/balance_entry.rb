class User::BalanceEntry < ActiveRecord::Base
  belongs_to :profit_report
  belongs_to :user

  validates :coins, presence: true
  validates :earnings, presence: true
end