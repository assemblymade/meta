class ProductOwnershipApiSerializer < ActiveModel::Serializer

  def ownership
    TransactionLogEntry.product_partners_with_balances(object.id)
  end

  def name
    object.name
  end
end
