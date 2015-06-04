class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :html, :json

  prepend_before_filter :authenticate_scope!, :only => [:edit_email]
  skip_before_action :validate_confirmed!, only: [:signup, :edit, :edit_email, :update]

  after_action :track_signup,          only: [:create], if: :signed_in?
  after_action :track_ab_goal,         only: [:create], if: :signed_in?
  after_action :claim_invite,          only: [:create], if: :signed_in?
  after_action :create_signup_nfi,     only: [:create], if: :signed_in?

  def create
    build_resource(sign_up_params.select{|k,v| v.present? })

    if resource.save
      finished('community_section_converts_best')
      if resource.active_for_authentication?
        set_flash_message :notice, :signed_up if is_navigational_format?
        sign_up(resource_name, resource)
        respond_to do |format|
          format.html { redirect_to(after_sign_up_path_for_user) }
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

  protected

  def claim_invite
    Invite.find(cookies[:invite]).claim!(resource) if self.resource && cookies[:invite]
  end

  def sign_up_params
    params.require(:user).permit(
      :email,
      :username,
      :extra_data,
      :facebook_uid,
      :location,
      :name,
      :password,
      :password_confirmation,
      :source,
      :follow_product,
      :avatar_url
    )
  end

  def account_update_params
    params.require(:user).permit(:current_password, :email, :location, :name, :password, :password_confirmation)
  end

  def track_signup
    flash[:signed_up] = true if signed_in?
  end

  def track_ab_goal
    finished('discover_homepage')
    finished('signup_conversion_from_focus_homepage')
  end

  def create_signup_nfi
    nfi = NewsFeedItem.create_with_target(current_user)
    if kernel = User.kernel
      nfi.hearts.create(
        user: kernel
      )
    end
  end

end
