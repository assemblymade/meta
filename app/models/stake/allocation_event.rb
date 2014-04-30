require 'activerecord/uuid'

class Stake::AllocationEvent < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :user
  belongs_to :allocation_run
  
end