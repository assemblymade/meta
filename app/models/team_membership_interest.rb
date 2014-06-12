class TeamMembershipInterest < ActiveRecord::Base
  belongs_to :team_membership
  belongs_to :interest
end
