class PartnerSerializer < ApplicationSerializer
  has_one :user
  attributes :coins

  def coins
    TransactionLogEntry.product_balances(object)
  end

end
