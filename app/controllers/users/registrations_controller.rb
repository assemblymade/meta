class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :html, :json

  prepend_before_filter :authenticate_scope!, :only => [:edit_email]
  skip_before_action :validate_confirmed!, only: [:signup, :edit, :edit_email, :update]

  before_action :check_assets_cookie,    only: [:create]

  after_action :track_signup,          only: [:create]
  after_action :email_welcome_package, only: [:create]
  after_action :claim_invite,          only: [:create]
  after_action :claim_assets,          only: [:create]

  def create
    build_resource(sign_up_params.select{|k,v| v.present? })

    if resource.save
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

  def check_assets_cookie
    if cookies[:assembly_assets_promotion]
      session[:previous_url] = product_path(Product.find_by_slug('assemblycoins'))
    end
  end

  def claim_assets
    if cookies[:assembly_assets_promotion]
      promo_product = Product.find_by_slug('assemblycoins')

      unless AssemblyAsset.find_by(user: current_user, product: promo_product).try(:where, 'promo_redeemed_at is not null').try(:any?)
        asset = AssemblyAsset.new(
          product: promo_product,
          user: current_user,
          amount: AssemblyAsset::PROMO_COINS,
          promo_redeemed_at: Time.now
        )

        begin
          asset.grant!(promo=true)

          flash[:first_assets_granted] = true
        rescue => e
          flash[:assets_error] = "There was a problem communicating with the Assembly Coins API. We've been alerted and will resolve the issue and send you your first Coins right away."
        end
      end
    end
  end

  def sign_up_params
    params.require(:user).permit(:email, :username, :extra_data, :facebook_uid, :location, :name, :password, :password_confirmation, :follow_product, :avatar_url)
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
