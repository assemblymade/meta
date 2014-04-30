class MilestoneTask < ActiveRecord::Base
  belongs_to :milestone
  belongs_to :task

  validates :task, uniqueness: { scope: :milestone_id }
end