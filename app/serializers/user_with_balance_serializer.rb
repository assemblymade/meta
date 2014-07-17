class UserWithBalanceSerializer < UserSerializer
  attributes :product_balance
  
  def product_balance
    TransactionLogEntry.where(wallet_id: object.id).with_cents.group(:product_id).having('count(*) > 0').sum(:cents)
  end
end
