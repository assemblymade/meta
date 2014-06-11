class NewsletterMailer < BaseMailer

  helper :markdown

  def published(newsletter_id, user_id)
    @newsletter = Newsletter.find(newsletter_id)
    @user = User.find(user_id)
    mail to: @user.email_address,
         from: 'Austin Smith (@awwstn) <austin@assemblymade.com>',
         subject: @newsletter.subject
  end

end
