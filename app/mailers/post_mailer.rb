class PostMailer < BaseMailer
  include MarkdownHelper

  layout 'email'
  helper :markdown

  def created(post_id, user_id)
    mailgun_campaign 'notifications'

    @post = Post.find(post_id)
    @user = User.find(user_id)
    @product = @post.product
    @recent = @product.posts.where('created_at < ?', @post.created_at).order("created_at desc").limit(3)

    mailgun_tag "post##{@post.product.slug}"

    prevent_delivery(@user)

    mail from: from_address_for(@post.user),
         to: @user.email_address,
         subject: "[#{@product.name}] #{@post.title}"
  end

  def mailing_list(post_id, email_address)
    mailgun_campaign 'notifications'

    @post = Post.find(post_id)
    @product = @post.product
    @recent = @product.posts.where('created_at < ?', @post.created_at).order("created_at desc").limit(3)

    mailgun_tag "post##{@post.product.slug}"

    mail to: email_address,
         subject: @post.title
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

private

  def prevent_delivery(user)
    mail.perform_deliveries = false if user.mail_never?
  end

end
