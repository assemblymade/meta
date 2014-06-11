class TeamMembershipSerializer < ApplicationSerializer
  has_one :user
  attributes :interests, :core_team?, :bio

  def interests
    ProductInterest.where(user: user, product: object.product).map(&:interest).map(&:slug)
  end
end
