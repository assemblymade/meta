class PartnershipMailer < BaseMailer
  layout 'new_email'

  helper FiresizeHelper
  helper AppIconHelper

  def create(user_id, product_id)
    mailgun_campaign 'ProductCreation'

    @user = User.find(user_id)
    @product = Product.find(product_id)

    mailgun_tag "ProductCreation"
    prevent_delivery_to_unsubscribed_users

    mail to: @user.email_address,
    subject: "You've now an owner of " + @product.name
  end

end
