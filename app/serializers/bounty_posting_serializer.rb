class BountyPostingSerializer < ApplicationSerializer
  attributes :ends_at

  def ends_at
    object.ends_at.iso8601
  end
end
