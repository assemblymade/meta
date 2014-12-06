class SuggestionMailer < BaseMailer
  layout 'suggested_bounties'
  helper FiresizeHelper
  helper AppIconHelper

  def create(user_id)
    mailgun_campaign 'suggestions'

    @user = User.find(user_id)
    @username = @user.username
    @products = @user.top_products.pluck(:product_id).map{|a| Product.find(a) }.take(3)
    @bounties = @user.top_bountys.where('rank < 4').map{|a| Wip.find(a.wip_id)}
    @tags = @user.user_identity.get_mark_vector.take(5)
    @body_style = "background:#f4f4f5;"

    mailgun_tag "suggestions"

    prevent_delivery_to_unsubscribed_users
    if @products.count == 0 || @bounties.count == 0 || @tags.count == 0
      mail.perform_deliveries = false
    end

    mail to: @user.email_address,
    subject: "hi"
  end

end
