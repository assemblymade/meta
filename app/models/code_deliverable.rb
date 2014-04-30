require 'activerecord/uuid'

class CodeDeliverable < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :user
  belongs_to :wip

end
