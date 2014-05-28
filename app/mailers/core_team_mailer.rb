class CoreTeamMailer < BaseMailer

  def welcome(product_id, user_id)
    @product = Product.find(product_id)
    @user = @product.core_team.find(user_id)

    mail to: @user.email_address.to_s,
         cc: (@product.core_team - [@user]).map {|u| u.email_address.to_s },
         subject: "Welcome to the #{@product.name} Core Team"
  end

end
