class TiltMailer < BaseMailer
  layout 'new_email'

  helper FiresizeHelper
  helper AppIconHelper

  def create(user_id, idea_id)
    mailgun_campaign 'Tilt'

    @user = User.find(user_id)
    @idea = Idea.find(idea_id)
    if @idea.tentative_name
      @name = @idea.tentative_name
    else
      @name = @idea.name
    end

    mailgun_tag "Tilt"
    prevent_delivery_to_unsubscribed_users

    mail to: @user.email_address,
    subject: "You're ready to kick off #{@name}"
  end

end
