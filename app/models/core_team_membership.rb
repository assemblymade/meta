# TODO: (whatupdave) Remove this in favor of team membership
class CoreTeamMembership < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :product, touch: true
  belongs_to :user

  validates :user, uniqueness: { scope: :product }

end