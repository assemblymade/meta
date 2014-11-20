class Partner

  attr_reader :product
  attr_reader :wallet

  def initialize(product, wallet)
    @product = product
    @wallet = wallet
  end

  def coins
    TransactionLogEntry.where(
      product_id: @product.id,
      wallet_id: @wallet.id
    ).sum(:cents)
  end

  def ownership
    return 0 if total_coins.zero?

    coins.to_f / total_coins.to_f
  end

  def total_coins
    TransactionLogEntry.where(product_id: @product.id).sum(:cents)
  end

end
