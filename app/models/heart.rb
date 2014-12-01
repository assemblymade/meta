class Heart < ActiveRecord::Base
  belongs_to :user
  belongs_to :heartable, polymorphic: true, counter_cache: true, touch: true

  scope :unsent, -> { where(sent_at: nil) }

  validates :heartable_id, uniqueness: { scope: :user }
end
