class Users::SessionsController < Devise::SessionsController
  respond_to :html, :json

  skip_before_action :validate_confirmed!, only: [:destroy]

  def new
  end

  def show
    if signed_in?
      render json: current_user
    else
      render :nothing => true, :status => :unauthorized
    end
  end

  def create
    respond_to do |format|
      format.html { super }
      format.json {
        if self.resource = warden.authenticate(auth_options)
          set_flash_message(:notice, :signed_in) if is_navigational_format?
          sign_in(resource_name, resource)
          resource.remember_me!
          respond_with resource, :location => after_sign_in_path_for(resource)
        else
          Rails.logger.info("User authentication failed username=#{params[:user][:login]}")
          render json: { errors:  { password: ["Wrong password"]} }, status: 401
        end
      }
    end
  end

end
