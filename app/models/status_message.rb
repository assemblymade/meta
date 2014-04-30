require 'activerecord/uuid'

class StatusMessage < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :product
  belongs_to :user

  validates :body, length: { minimum: 2, maximum: 140 }
end
