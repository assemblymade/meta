class TeamMembershipSerializer < ApplicationSerializer
  has_one :user
  attributes :interests, :core_team?, :bio

  def interests
    object.team_membership_interests.map(&:interest).map(&:slug)
  end
end
