class UserContribution < Struct.new(:product, :contribution_count, :cents, :stake)
  def self.for(user)
    event_contributions = Event.joins(:wip).where(user_id: user.id).group(:product_id).count
    work_contributions = Work.where(user_id: user.id).group(:product_id).count

    contributions = event_contributions.merge(work_contributions) {|k, v1, v2| v1 + v2 }
    product_cents = Hash[TransactionLogEntry.product_balances(user)]
    total_cents = TransactionLogEntry.product_totals

    contributions.map do |product_id, contribution_count|
      cents = (product_cents[product_id] || 0)
      stake = 0
      if cents > 0
        stake = (cents / total_cents[product_id].to_f)
      end

      UserContribution.new(
        Product.find(product_id),
        contribution_count,
        cents,
        stake
      )
    end
  end
end
