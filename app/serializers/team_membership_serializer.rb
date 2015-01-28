class TeamMembershipSerializer < ApplicationSerializer
  has_one :user
  # has_one :product
  attributes :interests, :core_team?, :bio, :url

  def interests
    object.team_membership_interests.map(&:interest).map(&:slug)
  end

  def url
    product_team_membership_path(object.product, object)
  end
end
