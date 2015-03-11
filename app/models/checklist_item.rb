class ChecklistItem < ActiveRecord::Base
  belongs_to :product
  belongs_to :idea
  belongs_to :user
  belongs_to :checklist_type
end
