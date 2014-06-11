class TeamMembership < ActiveRecord::Base
  belongs_to :product
  belongs_to :user

  scope :active, -> { where('deleted_at is null') }

  def core_team?
    self.is_core
  end
end
