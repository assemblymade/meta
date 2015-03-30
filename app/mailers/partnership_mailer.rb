class PartnershipMailer < BaseMailer
  layout 'new_email'

  helper FiresizeHelper
  helper AppIconHelper

  def create(user_id, product_id, idea_id)
    mailgun_campaign 'Partnership'

    @user = User.find(user_id)
    @product = Product.find(product_id)
    @idea = Idea.find(idea_id)

    mailgun_tag "Partnership"
    prevent_delivery_to_unsubscribed_users

    mail to: @user.email_address,
    subject: "You're now an owner of " + @product.name
  end

end
