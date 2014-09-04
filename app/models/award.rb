class Award < ActiveRecord::Base
  belongs_to :awarder, class_name: 'User'
  belongs_to :winner, class_name: 'User'
  belongs_to :event
  belongs_to :wip
end
