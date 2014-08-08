class ProfitReportSerializer < ActiveModel::Serializer
  has_many :user_balances

  attributes :end_at, :revenue, :expenses, :coins, :annuity
end