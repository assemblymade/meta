class TeamMembership < ActiveRecord::Base
  belongs_to :product
  belongs_to :user

  has_many :team_membership_interests

  scope :active, -> { where('deleted_at is null') }
  scope :core_team, -> { where('is_core is true') }

  def core_team?
    self.is_core
  end
end
