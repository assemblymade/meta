require 'activerecord/uuid'

class EmailLog < ActiveRecord::Base
  include ActiveRecord::UUID
end
