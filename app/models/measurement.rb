require 'activerecord/uuid'

class Measurement < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :metric
end
