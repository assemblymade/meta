class Admin::WipsController < AdminController
  def index
    @comment_groups = Event::Comment.includes(:wip).
      order('created_at DESC').
      limit(100).
      chunk { |c| c.wip }
  end
end
