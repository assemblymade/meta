class NotificationsController < ApplicationController
  before_action :authenticate_user!

  def index
    @stories = NewsFeed.new(current_user).page(params[:top_id])

    @users = @stories.map(&:activities).flatten.map(&:actor).flatten.uniq
  end
end
