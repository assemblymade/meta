class UserContribution < Struct.new(:product, :cents, :total_cents)
  def self.for(user, launched_only=false)

    # TODO: this should be able to load all product columns. WTF
    product_id_balances = Hash[TransactionLogEntry.products_with_balance(user, launched_only)]

    products = Product.where(id: product_id_balances.keys).to_a # shouldn't need this step
    total_cents = TransactionLogEntry.product_totals

    product_id_balances.map do |product_id, balance|
      product = products.find{|product| product.id == product_id}
      UserContribution.new(
        product,
        balance || 0,
        total_cents[product_id]
      )
    end
  end

  def self.for_product(user, product)
    user_cents = TransactionLogEntry.where(wallet_id: user.id).where(product_id: product.id).with_cents.sum(:cents)
    total_cents = TransactionLogEntry.where(product_id: product.id).with_cents.sum(:cents)

    UserContribution.new(
      product,
      user_cents,
      total_cents
    )
  end

  def coins
    cents / 100.to_d
  end

  def stake
    if cents > 0
      (cents / total_cents.to_f)
    else
      0
    end
  end
end
