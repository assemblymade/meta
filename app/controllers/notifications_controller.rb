class NotificationsController < ApplicationController
  respond_to :json

  def index
    @stories = NewsFeed.new(current_user).page(params[:top_id])
    @users = @stories.map(&:activities).flatten.map(&:actor).flatten.uniq

    respond_to do |format|
      format.html
      format.js   { render :json => { users: @users, stories: @stories } }
      format.json { render :json => { users: @users, stories: @stories } }
    end
  end
end
