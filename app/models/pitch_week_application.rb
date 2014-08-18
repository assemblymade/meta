class PitchWeekApplication < ActiveRecord::Base
  include Kaminari::ActiveRecordModelExtension

  belongs_to :applicant
  belongs_to :product

  scope :to_review, -> { where(reviewed_at: nil) }

  def review(reviewer, outcome)
    update(
      reviewed_at: Time.now,
      reviewer_id: reviewer.id,
      is_approved: outcome
    )
  end
end
