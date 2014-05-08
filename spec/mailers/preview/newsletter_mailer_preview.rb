class NewsletterMailerPreview < ActionMailer::Preview

  def published
    newsletter = Newsletter.unpublished.sample
    user = User.sample
    NewsletterMailer.published(newsletter.id, user.id)
  end

end
