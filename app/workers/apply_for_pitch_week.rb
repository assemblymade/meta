class ApplyForPitchWeek < ActiveJob::Base
  queue_as :default

  def perform(product_id, applicant_id)
    PitchWeekApplication.create!(
      product_id: product_id,
      applicant_id: applicant_id
    )
  end
end
