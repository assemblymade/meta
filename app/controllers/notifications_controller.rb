class NotificationsController < ApplicationController
  respond_to :json

  def index
    @stories = NewsFeed.new(current_user).page(params[:top_id])
    @users = @stories.map(&:activities).flatten.map(&:actor).flatten.uniq
  end
end