require 'activerecord/uuid'
require 'core_ext/time_ext'

class Stake::AllocationRun < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :product

  has_many :events, class_name: 'Stake::AllocationEvent'
end