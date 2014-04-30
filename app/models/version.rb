require 'activerecord/uuid'

class Version < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :versioned, :polymorphic => true
  belongs_to :user
end