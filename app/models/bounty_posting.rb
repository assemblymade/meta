class BountyPosting < ActiveRecord::Base
  belongs_to :bounty, class_name: 'Wip', foreign_key: "bounty_id", inverse_of: :postings, touch: true
  belongs_to :poster, class_name: 'User'

  default_scope -> { where('expired_at is null') }

  def self.tagged(tag)
    includes(bounty: :product).
      joins(bounty: :tags).
      where('wip_tags.name = ?', tag).
      order(created_at: :desc)
  end

  def ends_at
    created_at + 7.days
  end
end