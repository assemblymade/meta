class ActivitySerializer < ApplicationSerializer

  has_one :actor
  has_one :subject
  has_one :target

end
