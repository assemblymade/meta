class DigestMailer < BaseMailer
  include ActionView::Helpers::TextHelper

  helper :markdown
  helper_method :today

  layout 'mail/newsletter'

  def weekly(user_id, newsletter_id)
    mailgun_tag 'digest#weekly'
    @user = User.find(user_id)
    @newsletter = Newsletter.find(newsletter_id)

    @products = Showcase.showcasing_in_date_range(Date.today, 1.week.ago).sort_by do |showcase|
      showcase.product.combined_watchers_and_voters.count
    end.reverse.map {|showcase| showcase.product }

    @featured_product = @products.shift

    mail(to: @user.email, subject: @newsletter.subject) do |format|
      format.html { render layout: nil }
    end
  end

end
