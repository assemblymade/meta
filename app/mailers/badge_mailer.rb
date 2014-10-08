class BadgeMailer < BaseMailer
  include ActionView::Helpers::TextHelper

  layout 'email'

  def first_win(event_id)
    mailgun_campaign 'notifications'

    @event = Event.find(event_id)
    @wip = @event.wip.decorate
    @product = @wip.product
    @user = @event.user
    @awarder = @wip.closer || @wip.awards.last.awarder

    mail to: @user.email_address,
         subject: "Boom! You got #{pluralize @wip.value, 'coin'}."
  end

end
