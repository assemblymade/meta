class StakeMailer < BaseMailer
  include ActionView::Helpers::NumberHelper

  layout 'email'

  def coin_balance(product_id, user_id)
    @user = User.find(user_id)
    @product = Product.find(product_id)

    @contribution = UserContribution.for_product(@user, @product)

    mail      to: @user.email_address,
         subject: "Summary on your #{@product.name} stake for #{Date.today.strftime('%B')}"
  end
end
