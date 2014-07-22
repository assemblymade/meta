class NotificationsController < ApplicationController
  respond_to :json

  def index
    @activities = ActivityStream.new(current_user).page(params[:top_id])
  end
end