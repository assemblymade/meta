class NotificationsController < ApplicationController
  before_action :authenticate_user!

  def index
    @stories = NewsFeed.new(current_user).page(params[:top_id])

    render json: @stories
  end


end
