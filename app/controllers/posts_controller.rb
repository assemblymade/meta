class PostsController < ProductController
  respond_to :html, :json

  def index
    find_product!
    query = @product.posts.order(created_at: :desc)

    posts = if params[:archived]
      query.archived
    else
      query.unarchived
    end

    @posts = ActiveModel::ArraySerializer.new(posts)
    @heartables = query.map(&:news_feed_item)

    respond_with @posts, location: product_posts_path(@product)
  end

  def new
    find_product!
    authenticate_user!

    @post = @product.posts.new(author: current_user)
  end

  def create
    find_product!
    authenticate_user!

    @post = @product.posts.new(post_params)
    @post.author = current_user

    if @post.save
      if @product.core_team?(@post.user)
        send_emails!
      end

      Activities::Post.publish!(
        actor: @post.author,
        subject: @post,
        target: @product,
        socket_id: params[:socket_id]
      )
    end

    respond_with @post, location: product_post_path(@post.product, @post)
  end

  def preview
    find_product!
    authenticate_user!

    PostMailer.delay(queue: 'mailer').preview(@product.id, post_params.to_hash, current_user.id)

    render nothing: true
  end

  def show
    find_product!
    find_post!
    find_heartables!
  end

  def edit
    find_product!
    authenticate_user!
    find_post!
    authorize! :update, @post
  end

  def update
    find_product!
    authenticate_user!
    find_post!

    @post.update(post_params)

    respond_with @post, location: product_post_path(@post.product, @post)
  end

private

  def find_heartables!
    nfi = @post.news_feed_item

    heartables = ([nfi] + nfi.comments).to_a
    @heartables = ActiveModel::ArraySerializer.new(heartables)
    @user_hearts = if signed_in?
      Heart.where(user_id: current_user.id).where(heartable_id: heartables.map(&:id))
    end
  end

  def find_post!
    if (params[:id] || '').uuid?
      @post = Post.find(params[:id])
    else
      @post = @product.posts.find_by_slug!(params[:id])
    end
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
    params.require(:post).permit(:title, :summary, :body, :published_at, :flagged_at)
  end

end
