class PitchWeekApplication < ActiveRecord::Base
  include Kaminari::ActiveRecordModelExtension

  belongs_to :applicant
  belongs_to :product

  scope :approved, -> { where(is_approved: true) }
  scope :in_pitch_week, ->(at=Time.now) { where('reviewed_at > ?', at - 7.days) }
  scope :to_review, -> { where(reviewed_at: nil) }

  def review(reviewer, outcome)
    update(
      reviewed_at: Time.now,
      reviewer_id: reviewer.id,
      is_approved: outcome
    )
  end

  def pitch_week_end
    reviewed_at + 7.days
  end
end
