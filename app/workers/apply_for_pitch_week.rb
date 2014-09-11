class ApplyForPitchWeek
  include Sidekiq::Worker

  def perform(product_id, applicant_id)
    application = PitchWeekApplication.create!(
      product_id: product_id,
      applicant_id: applicant_id
    )

    PitchWeekMailer.awaiting_approval(application.id).deliver
  end
end
