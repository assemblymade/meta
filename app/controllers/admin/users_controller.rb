class Admin::UsersController < AdminController
  respond_to :html, :json

  def index
    @users = User.order('created_at desc').page(params[:page]).per(params[:per] || 100)
    respond_with @users
  end
end
