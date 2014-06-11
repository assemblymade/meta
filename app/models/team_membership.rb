class TeamMembership < ActiveRecord::Base
  belongs_to :product
  belongs_to :user

  has_many :team_membership_interests

  scope :active, -> { where('deleted_at is null') }

  def core_team?
    self.is_core
  end
end
