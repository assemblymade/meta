class PostMailer < ActionMailer::Base
  include MarkdownHelper

  layout 'email'
  helper :markdown

  def created(post_id, user_id)
    @post = Post.find(post_id)
    @user = User.find(user_id)

    mail to: @user.email_address,
         subject: @post.title

    prevent_delivery(@user)
  end

private

  def prevent_delivery(user)
    mail.perform_deliveries = false if user.mail_never?
  end

end
