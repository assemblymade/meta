class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :html, :json

  prepend_before_filter :authenticate_scope!, :only => [:edit_email]
  skip_before_action :validate_confirmed!, only: [:signup, :edit, :edit_email, :update]

  after_action :track_signup,          :only => :create
  after_action :email_welcome_package, :only => :create

  def signup
    @user = User.new
    @deprecated_stylesheet = true
  end

  def create
    build_resource(sign_up_params)

    if resource.save

      if resource.active_for_authentication?
        set_flash_message :notice, :signed_up if is_navigational_format?
        sign_up(resource_name, resource)
        respond_to do |format|
          format.html { redirect_to(after_sign_up_path_for(resource)) }
          format.json { render json: resource }
        end
      else
        set_flash_message :notice, :"signed_up_but_#{resource.inactive_message}" if is_navigational_format?
        expire_session_data_after_sign_in!
        respond_with resource, :location => after_inactive_sign_up_path_for(resource)
      end
    else
      clean_up_passwords resource
      respond_to do |format|
        format.html { render :new }
        format.json { render :json => { errors: resource.errors }, :status => :unprocessable_entity }
      end
    end
  end

  def welcome
    @deprecated_stylesheet = true
  end

  protected

  def sign_up_params
    params.require(:user).permit(:email, :username, :extra_data, :facebook_uid, :location, :name, :password, :password_confirmation, :follow_product)
  end

  def account_update_params
    params.require(:user).permit(:current_password, :email, :location, :name, :password, :password_confirmation)
  end

  def track_signup
    flash[:signed_up] = true if signed_in?
  end

  def email_welcome_package
    UserMailer.delay_for(10.minutes).welcome(current_user.id) if signed_in?
  end
end
