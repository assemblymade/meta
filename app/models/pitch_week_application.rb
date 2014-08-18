class PitchWeekApplication < ActiveRecord::Base
  belongs_to :applicant
  belongs_to :product
end
