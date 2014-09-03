class PostsController < ProductController
  respond_to :html

  def index
    find_product!
    @post = @product.posts.order(created_at: :desc).first
    if @post
      return redirect_to product_post_path(@post.product, @post)
    else
      return redirect_to new_product_post_path(@product)
    end
  end

  def new
    find_product!
    authenticate_user!
    authorize! :create, Post
    @post = @product.posts.new(author: current_user)
  end

  def create
    find_product!
    authenticate_user!
    authorize! :create, Post
    @post = @product.posts.new(post_params)
    @post.author = current_user
    @post.save

    Subscriber.where(product_id: @product.id).each do |email|
      PostMailer.delay(queue: 'mailer').mailing_list(@post.id, email)
    end

    @product.watchers.each do |watcher|
      PostMailer.delay(queue: 'mailer').created(@post.id, watcher.id)
    end

    respond_with @post, location: product_post_path(@post.product, @post)
  end

  def preview
    find_product!
    authenticate_user!
    authorize! :create, Post

    PostMailer.delay(queue: 'mailer').preview(@product.id, post_params.to_hash, current_user.id)

    render nothing: true
  end

  def show
    find_product!
    @post = @product.posts.find_by_slug!(params[:id])
  end

  def edit
    find_product!
    authenticate_user!
    @post = @product.posts.find_by_slug!(params.fetch(:id))
    authorize! :update, @post
  end

  def update
    find_product!
    authenticate_user!
    @post = @product.posts.find_by_slug!(params.fetch(:id))
    authorize! :update, @post

    @post.update_attributes(post_params)

    respond_with @post, location: product_post_path(@post.product, @post)
  end

private

  def upgrade_stylesheet?
    true
  end

  def post_params
    params.require(:post).permit(:title, :summary, :body, :published_at)
  end

end
