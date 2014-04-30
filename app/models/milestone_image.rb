class MilestoneImage < ActiveRecord::Base
  belongs_to :user
  belongs_to :milestone, counter_cache: true, touch: true
  belongs_to :attachment
end