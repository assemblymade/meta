class Deed < ActiveRecord::Base
  belongs_to :user
  belongs_to :karma_event, polymorphic: true
end
