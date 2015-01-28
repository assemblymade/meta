class ProductMailer < BaseMailer
  helper :markdown
  helper :wip

  layout 'email'

  include ActionView::Helpers::TextHelper

  def congratulate_on_greenlight(idea_id)
    mailgun_campaign 'notifications'

    @idea = Idea.find(idea_id)

    creator = @idea.user

    mail from: "#{@idea.name} <notifications@assemblymail.com>",
           to: creator,
      subject: "Turn on the greenlight!"
  end
end
