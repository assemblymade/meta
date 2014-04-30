require 'activerecord/uuid'

class Unique < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :metric
end
