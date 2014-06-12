class UnreadSerializer < ApplicationSerializer
  attributes :timestamp

  def timestamp
    object.updated_at.to_i
  end
end