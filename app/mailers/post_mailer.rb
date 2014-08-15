class PostMailer < BaseMailer
  include MarkdownHelper

  layout 'email'
  helper :markdown

  def created(post_id, user_id)
    @post = Post.find(post_id)
    @user = User.find(user_id)

    mailgun_tag "post##{@post.product.slug}"

    prevent_delivery(@user)

    mail to: @user.email_address,
         subject: @post.title
  end

  def mailing_list(post_id, email_address)
    @post = Post.find(post_id)

    mailgun_tag "post##{@post.product.slug}"

    mail to: email_address,
         subject: @post.title
  end

  def preview(product_id, params, author_id)
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

private

  def prevent_delivery(user)
    mail.perform_deliveries = false if user.mail_never?
  end

end
