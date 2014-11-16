class Heart < ActiveRecord::Base
  belongs_to :user
  belongs_to :heartable, polymorphic: true, counter_cache: true, touch: true

  validates :heartable_id, uniqueness: { scope: :user }
end
