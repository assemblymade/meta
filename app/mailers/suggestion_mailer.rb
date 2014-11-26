class SuggestionMailer < ActionMailer::Base
  default from: "from@example.com"

  def create(user_id, bounty_limit)
    #mailgun_campaign 'bounty_suggestions'

    if @user = User.find(user_id)

      @products = @user.user_identity.find_best_products(4)
      @bounties = []
      @products.each do |bp|
        @bounties = @bounties + @user.user_identity.find_best_wips(bounty_limit, bp[0].wips.where(state: 'open'))
      end

      @tags = @user.user_identity.get_mark_vector

      #mailgun_tag "bounty_suggestions"

      #prevent_delivery(@user)

      mail to: @user.email_address,
           subject: "Bounty Suggestions"
         end

    end


  def preview(product_id, params, author_id)
    mailgun_campaign 'notifications'

    @product = Product.find(product_id)
    @post = Post.new(params)
    @user = User.find(author_id)

    @post.product = @product
    @post.author = @user
    @post.id = SecureRandom.uuid

    mail(to: @user.email_address, subject: @post.title) do |format|
      format.html { render template: 'post_mailer/created' }
    end
  end



end
