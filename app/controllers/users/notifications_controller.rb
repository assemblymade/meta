class Users::NotificationsController < ApplicationController
  respond_to :html, :json

  before_action :authenticate_user!

  def edit
    if params[:auth_token] and params[:preference]
      current_user.update_attributes(mail_preference: params[:preference])
      redirect_to settings_notifications_path
    end
  end

  def update
    current_user.update_attributes(notifications_params)

    respond_with current_user, location: settings_notifications_path
  end

  # private

  def notifications_params
    params.require(:user).permit(:mail_preference)
  end
end
