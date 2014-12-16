class Heart < ActiveRecord::Base
  belongs_to :user
  belongs_to :heartable, polymorphic: true, counter_cache: true, touch: true

  scope :unsent, -> { where(sent_at: nil) }

  validates :heartable_id, uniqueness: { scope: :user }
  validates :user, presence: true

  def product
    heartable.try(:product)
  end

  def self.store_data(heartables)
    heartables.map do |h|
      {
        heartable_id: h.id,
        heartable_type: h.class.name,
        hearts_count: h.hearts_count
      }
    end
  end
end
