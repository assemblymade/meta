require 'activerecord/uuid'

class CopyDeliverable < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :user
  belongs_to :wip
end