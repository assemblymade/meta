class TopBounty < ActiveRecord::Base
  belongs_to :user
  has_one :wip
end
