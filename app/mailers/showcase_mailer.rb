class ShowcaseMailer < BaseMailer
  include ActionView::Helpers::DateHelper

  default 'X-Mailgun-Tag' => 'showcase#notification'

  def product_soon_to_be_featured(showcase_id)
    @showcase = Showcase.find(showcase_id)
    @product = @showcase.product
    @user = @product.user

    mail(
      to:   @user.email,
      subject: "#{@product.name} will be featured in #{time_ago_in_words(@showcase.showcased_at)}"
    )
  end

  def product_is_featured(showcase_id)
    @showcase = Showcase.find(showcase_id)
    @product = @showcase.product
    @user = @product.user

    mail(
      to:   @user.email,
      subject: "#{@product.name} has been featured on Assembly"
    )
  end

  def scheduled(*showcase_ids)
    @showcases = Showcase.where(id: showcase_ids)
    mail(
      cc: User.where(is_staff: true).pluck(:email),
      subject: "#{@showcases.count} staff picks scheduled"
    )
  end

end
