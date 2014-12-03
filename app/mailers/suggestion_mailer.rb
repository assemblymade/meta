class SuggestionMailer < ActionMailer::Base
  default from: "barisser@assembly.com"

  def create(user_id)
    mailgun_campaign 'bounty_suggestions'

    if @user = User.find(user_id)
      @username = @user.username
      @products = @user.top_products.pluck(:product_id).map{|a| Product.find(a) }.take(3)
      @bounties = @user.top_bountys.pluck(:wip_id).map{|a| Wip.find(a) }.take(3)
      @tags = @user.user_identity.get_mark_vector.take(5)

      mailgun_tag "bounty_suggestions"

      prevent_delivery(@user)

      if @products.count >0 and @bounties.count >0 and @tags.count >0
        mail to: @user.email_address,
        subject: "Bounty Suggestions on Assembly"
      end
    end
  end


end
