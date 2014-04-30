class AdminController < ApplicationController
  respond_to :html
  helper :admin

  before_action :authenticate_user!
  before_action :authenticate_staff!

  layout 'admin'

  def authenticate_staff!
    redirect_to(new_user_session_path) unless current_user.staff?
  end

end
