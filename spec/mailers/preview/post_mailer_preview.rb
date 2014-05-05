class PostMailerPreview < ActionMailer::Preview

  def created
    post = Post.where.not(title: nil).sample
    user = User.sample
    PostMailer.created(post.id, user.id)
  end

end
