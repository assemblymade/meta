class HeartSerializer < ApplicationSerializer
  attributes :heartable_type, :heartable_id

  has_one :user
end
