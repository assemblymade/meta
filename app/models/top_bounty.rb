class TopBounty < ActiveRecord::Base
  belongs_to :user
  belongs_to :wip
end
