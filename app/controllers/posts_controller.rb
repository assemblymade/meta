class PostsController < ProductController
  respond_to :html

  def index
    find_product!
    @post = @product.posts.order(created_at: :desc).first

    if @post
      redirect_to product_post_path(@post.product, @post)
    end
  end

  def new
    find_product!
    authenticate_user!
    @post = @product.posts.new(author: current_user)
    authorize! :create, @post
  end

  def create
    find_product!
    authenticate_user!

    @post = @product.posts.new(post_params)
    @post.author = current_user

    authorize! :create, @post

    @post.save

    Subscriber.where(product_id: @product.id).each do |email|
      PostMailer.delay(queue: 'mailer').mailing_list(@post.id, email)
    end

    @product.watchers.each do |watcher|
      PostMailer.delay(queue: 'mailer').created(@post.id, watcher.id)
    end

    Activities::Post.publish!(
      actor: @post.author,
      subject: @post,
      target: @product,
      socket_id: params[:socket_id]
    )

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
    @post = @product.posts.find_by_slug(params[:id]) || Post.find!(params[:id])
  end

  def edit
    find_product!
    authenticate_user!
    @post = @product.posts.find_by_slug(params.fetch(:id)) || Post.find!(params.fetch(:id))
    authorize! :update, @post
  end

  def update
    find_product!
    authenticate_user!
    @post = @product.posts.find_by_slug(params.fetch(:id)) || Post.find!(params.fetch(:id))
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
