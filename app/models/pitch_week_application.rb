class PitchWeekApplication < ActiveRecord::Base
  include Kaminari::ActiveRecordModelExtension

  belongs_to :applicant, class_name: 'User'
  belongs_to :product

  scope :approved, -> { where(is_approved: true) }
  scope :in_pitch_week, ->(at=Time.now) { where('reviewed_at > ?', at - 7.days) }
  scope :to_review, -> { where(reviewed_at: nil) }

  def review(reviewer, outcome)
    ActiveRecord::Base.transaction do
      update(
        reviewed_at: Time.now,
        reviewer_id: reviewer.id,
        is_approved: outcome
      )

      product.update(started_teambuilding_at: Time.now)
    end
  end

  def pitch_week_end
    reviewed_at + 7.days
  end
end
