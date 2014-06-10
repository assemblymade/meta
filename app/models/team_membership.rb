class TeamMembership < ActiveRecord::Base
  belongs_to :product
  belongs_to :user

  def core_team?
    self.is_core
  end
end