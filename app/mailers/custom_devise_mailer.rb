class CustomDeviseMailer < Devise::Mailer
  def confirmation_instructions(record, token, opts={})
    mailgun_campaign 'system'
    super
  end

  def reset_password_instructions(record, token, opts={})
    mailgun_campaign 'system'
    super
  end

  def unlock_instructions(record, token, opts={})
    mailgun_campaign 'system'
    super
  end

  private

  def mailgun_campaign(campaign_id)
    @mailgun_campaign = campaign_id.to_s
    headers 'X-Mailgun-Campaign-Id' => @mailgun_campaign
  end
end
