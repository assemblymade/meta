class ApplyForPitchWeek
  include Sidekiq::Worker

  def perform(product_id, applicant_id)
    PitchWeekApplication.create!(
      product_id: product_id,
      applicant_id: applicant_id
    )
  end
end
