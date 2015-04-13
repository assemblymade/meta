class ProductApiSerializer < ApplicationSerializer
  attributes :ownership, :name

  def ownership
    TransactionLogEntry.product_partners_with_balances(object.id)
  end

  def name
    object.name
  end
end
