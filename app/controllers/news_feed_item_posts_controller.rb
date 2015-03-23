class NewsFeedItemPostsController < ProductController
  def show
    find_product!
    @post = @product.news_feed_item_posts.find(params[:id])
    @news_feed_item = @post.news_feed_item
    store_data post: @post
  end
end
