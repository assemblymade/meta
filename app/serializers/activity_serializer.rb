class ActivitySerializer < ApplicationSerializer
  attributes :verb
  has_one :actor
  has_one :subject
  has_one :target

  def verb
    object.type
  end

end
