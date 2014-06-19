class Tip < ActiveRecord::Base
  belongs_to :product
  belongs_to :from, class_name: 'User'
  belongs_to :to,   class_name: 'User'
  belongs_to :via,  touch: true, polymorphic: true

  def self.perform!(product, from, via, add_cents)
    to = via.tip_receiver
    created_at = Time.now

    tip = Tip.find_or_initialize_by(product: product, from: from, to: to, via: via)
    tip.cents ||= 0

    tip.with_lock do
      transaction_id = SecureRandom.uuid

      if add_cents > TransactionLogEntry.balance(product, from)
        raise ActiveRecord::Rollback
      end

      tip.cents += add_cents
      tip.save!

      TransactionLogEntry.create!(
        transaction_id: transaction_id,
        created_at: created_at,
        product: product,
        action: 'credit',
        work_id: via.id,
        user_id: to.id,
        cents: add_cents
      )

      TransactionLogEntry.create!(
        transaction_id: transaction_id,
        created_at: created_at,
        product: product,
        action: 'debit',
        work_id: via.id,
        user_id: from.id,
        cents: (-1 * add_cents)
      )
    end
    tip
  end
end
