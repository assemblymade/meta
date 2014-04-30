class CoreTeamMembership < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :product
  belongs_to :user

  validates :user, uniqueness: { scope: :product }

end