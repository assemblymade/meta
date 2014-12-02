class HeartSerializer < ApplicationSerializer
  attributes :heartable_type, :heartable_id

  has_one :user

  cached

  def cache_key
    [object]
  end
end
