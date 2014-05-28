class DigestMailer < BaseMailer
  include ActionView::Helpers::TextHelper

  helper :markdown
  helper_method :today

  layout 'mail/newsletter'

  def daily(user_id, unread_articles=[])
    mailgun_tag 'digest#daily'

    @user     = User.find(user_id)
    wip_group = WipGroup.new(
                  ReadRaptorSerializer.deserialize_articles(unread_articles)
                )
    @products = wip_group.products
    @watchers = wip_group.watchers.take(30) # 30 happy faces

    @recap_time = ActiveSupport::TimeZone["Pacific Time (US & Canada)"].now - 1.day

    subject = if @showcase.present?
      "What do you think of \"#{@showcase.first.product.pitch}\"?"
    else
      "#{pluralize wip_group.count, 'update'} on #{wip_group.product_names.to_sentence}"
    end

    mail to: @user.email,
         subject: subject
  end

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

  private

  def today
    @today ||= Date.today
  end

  def tag(name)
    headers 'X-Mailgun-Tag' => name.to_s
  end

end
