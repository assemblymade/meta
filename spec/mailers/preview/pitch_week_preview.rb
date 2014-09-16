class PitchWeekPreview < ActionMailer::Preview
  def awaiting_approval
    user = User.sample
    product = Product.sample
    application = PitchWeekApplication.create!(product_id: product.id, applicant_id: user.id)
    
    PitchWeekMailer.awaiting_approval(application)
  end
end
