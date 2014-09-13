class BountyPosting < ActiveRecord::Base
  belongs_to :bounty, class_name: 'Wip', foreign_key: "bounty_id", inverse_of: :postings, touch: true
  belongs_to :poster, class_name: 'User'

  scope :open_bounty, -> { joins(:bounty).where('wips.closed_at' => nil) }
  scope :unexpired, -> { where(expired_at: nil) }

  default_scope -> { unexpired.open_bounty }

  validates :bounty, uniqueness: true, presence: true

  SLOTS = ENV['PUBLIC_BOUNTY_SLOTS'].try(:to_i) || 3

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
    joins(:bounty).
      where('wips.product_id = ?', product.id).
      where('wips.closed_at is null').
      count
  end

  def expire!
    update!(expired_at: Time.now)
  end

end