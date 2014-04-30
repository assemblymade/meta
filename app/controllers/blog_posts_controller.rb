class BlogPostsController < ApplicationController

  def index
    redirect_to blog_post_path(BlogPost.recent.first.id)
  end

  def show
    @blog_post = BlogPost.find(params[:id])
  rescue BlogPost::PostNotFound => e
    return head(:not_found)
  end

end
