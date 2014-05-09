require 'activerecord/uuid'

class CompletedMission < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :product, touch: true
  belongs_to :completor, class_name: 'User'
end
