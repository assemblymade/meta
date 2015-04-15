class Tip < ActiveRecord::Base
  belongs_to :product
  belongs_to :from, class_name: 'User'
  belongs_to :to,   class_name: 'User'
  belongs_to :via,  touch: true, polymorphic: true
  has_one :deeds, as: :karma_event

  def self.perform!(product, from, via, add_cents)
    via.with_lock do
      created_at = Time.now
      to = via.tip_receiver

      tip = Tip.find_or_initialize_by(product: product, from: from, to: to, via: via)
      tip.cents ||= 0

      if entry = TransactionLogEntry.transfer!(product, from.id, to.id, add_cents, via.id, created_at)
        tip.cents += add_cents
        tip.save!

        TrackVested.perform_async(to.id, product.id, created_at)

        via.try(:tip_added)
        tip
      else
        nil
      end
    end
  end

  delegate :url_params, to: :via
end
