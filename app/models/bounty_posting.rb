class BountyPosting < ActiveRecord::Base
  belongs_to :bounty, class_name: 'Wip', foreign_key: "bounty_id", inverse_of: :postings, touch: true
  belongs_to :poster, class_name: 'User'

  default_scope -> { where('expired_at is null') }

  SLOTS = ENV['PUBLIC_BOUNTY_SLOTS'].try(:to_i) || 6

  def self.tagged(tag)
    includes(bounty: :product).
      joins(bounty: :tags).
      where('wip_tags.name = ?', tag).
      order(created_at: :desc)
  end

  def self.slots_available(product)
    [SLOTS - slots_used(product), 0].max
  end

  def self.slots_used(product)
    joins(:bounty).where('wips.product_id = ?', product.id).count
  end

  def ends_at
    created_at + 7.days
  end
end