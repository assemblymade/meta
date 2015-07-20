class PostsController < ProductController
  respond_to :html, :json

  def index
    redirect_to "https://assembly.com/#{params[:product_id]}"
  end

  def new
    redirect_to "https://assembly.com/#{params[:product_id]}"
  end

  def show
    redirect_to "https://assembly.com/#{params[:product_id]}"
  end

private

  def find_heartables!
    nfi = @post.news_feed_item

    heartables = ([nfi] + nfi.comments).to_a
    @heartables = ActiveModel::ArraySerializer.new(heartables)
    store_data heartables: @heartables
    if signed_in?
      store_data user_hearts: Heart.where(user_id: current_user.id).where(heartable_id: heartables.map(&:id))
    end
  end

  def find_post!
    if (params[:id] || '').uuid?
      @post = Post.find(params[:id])
    else
      @post = @product.posts.find_by_slug!(params[:id])
    end
    store_data post: @post
  end

  def send_emails!
    @product.subscribers.each do |subscriber|
      PostMailer.delay(queue: 'mailer').mailing_list(@post.id, subscriber.email)
    end

    @product.watchers.each do |watcher|
      PostMailer.delay(queue: 'mailer').created(@post.id, watcher.id)
    end
  end

  def upgrade_stylesheet?
    true
  end

  def post_params
    params.require(:post).permit(
      :title,
      :summary,
      :body,
      :published_at,
      :flagged_at,
      mark_names: []
    )
  end

end
