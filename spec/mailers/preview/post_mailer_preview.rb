class PostMailerPreview < ActionMailer::Preview

  def created
    post = Post.where.not(title: nil).sample
    user = User.sample
    PostMailer.created(post.id, user.id)
  end

  def mailing_list
    post = Post.where.not(title: nil).sample
    PostMailer.mailing_list(post.id, User.sample.email)
  end

  def preview
    product = Product.sample
    PostMailer.preview(product.id, {
      title: "7 Days, 1 MVP",
      body: "We rock!"
    }, product.core_team.sample)
  end

end
