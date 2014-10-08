class PitchWeekMailer < BaseMailer
  layout false

  def awaiting_approval(application_id)
    mailgun_campaign 'notifications'

    @application = PitchWeekApplication.find(application_id)
    @product = @application.product

    mail to: 'team@assembly.com',
      subject: "#{@product.name} was just submitted for approval"
  end
end
