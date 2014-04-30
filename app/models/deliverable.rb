require 'activerecord/uuid'

class Deliverable < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :attachment
  belongs_to :wip

  Design = 'design'
  Code   = 'code'
  Copy   = 'copy'
  Other  = 'other'
end