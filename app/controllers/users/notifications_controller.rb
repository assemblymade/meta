class Users::NotificationsController < ApplicationController
  before_action :authenticate_user!

  def edit
    @user = UserDecorator.new current_user

    render 'users/edit'
  end

end
