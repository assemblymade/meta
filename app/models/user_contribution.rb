class UserContribution < Struct.new(:product, :contribution_count, :cents, :total_cents)
  def self.for(user)
    product_cents = Hash[TransactionLogEntry.product_balances(user)]
    total_cents = TransactionLogEntry.product_totals

    product_contribution_counts(user).map do |product_id, contribution_count|
      cents = (product_cents[product_id] || 0)

      UserContribution.new(
        Product.find(product_id),
        contribution_count,
        cents,
        total_cents[product_id]
      )
    end
  end

  def self.for_product(user, product)
    user_cents = TransactionLogEntry.where(wallet_id: user.id).where(product_id: product.id).with_cents.sum(:cents)
    total_cents = TransactionLogEntry.where(product_id: product.id).with_cents.sum(:cents)

    UserContribution.new(
      product,
      product_contribution_counts(user)[product.id] || 0,
      user_cents,
      total_cents
    )
  end

  def self.product_contribution_counts(user)
    event_contributions = Event.joins(:wip).where(user_id: user.id).group(:product_id).count
    work_contributions = Work.where(user_id: user.id).group(:product_id).count

    event_contributions.merge(work_contributions) {|k, v1, v2| v1 + v2 }
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
