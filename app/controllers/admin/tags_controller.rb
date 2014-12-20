class Admin::TagsController < AdminController
  require 'kaminari'
  def index
    @stems = MarkStem.order(updated_at: :desc).page(params[:page]).per(50)
    @merge = MarkStem.order(marks_count: :desc).limit(10)
  end
end
