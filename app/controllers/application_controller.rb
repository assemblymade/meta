class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  before_action :store_location
  before_action :validate_confirmed!, :if => :signed_in?
  after_action :set_last_request_at!, :if => :signed_in?
  before_action :strip_auth_token,     :if => :signed_in?

  rescue_from CanCan::AccessDenied do |e|
    store_location
    redirect_to new_user_session_path
  end

  protected

  helper_method :after_sign_up_path_for_user
  helper_method :after_sign_in_path_for_user
  helper_method :after_welcome_path

  def after_sign_up_path_for_user
    welcome_tour_path
  end

  def strip_auth_token
    redirect_to(url_for(params.except(:auth_token))) if params[:auth_token].present?
  end

  def after_sign_up_path_for(resource)
    after_sign_up_path_for_user
  end

  def after_sign_in_path_for_user
    after_welcome_path
  end

  def after_welcome_path
    discover_path
  end

  def validate_confirmed!
    redirect_to :edit_user_email unless current_user.confirmed?
  end

  def set_last_request_at!
    current_user.delay.update_columns(last_request_at: Time.current)
  end

  def store_location
    if (request.fullpath != "/login" &&
        request.fullpath != "/logout" &&
        request.fullpath != "/signup" &&
        !request.xhr?) # don't store ajax calls
      session[:previous_url] = request.fullpath
    end
  end

  def after_sign_out_path_for(resource)
    session[:previous_url] || root_path
  end

  # pushes the event into flash which will then be rendered next page load
  def track_event(name, options=nil)
    Analytics.delay.track(
        user_id: current_user.try(:id),
        event: name,
        properties: options
    )
  end

  def set_no_cache
    response.headers["Cache-Control"] = "no-cache, no-store, max-age=0, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "Fri, 01 Jan 1990 00:00:00 GMT"
  end

  def set_product
    @product = Product.find_by_id_or_slug!((params[:product_id] || params[:id]).downcase).decorate
    authorize! :read, @product
  end

  # TODO remove these when we've removed WIPs
  def product_task_path(product, wip, options={})
    product_wip_path(product, wip, options)
  end
  def product_task_url(product, wip, options={})
    product_wip_url(product, wip, options)
  end

  helper_method :deprecated_stylesheet?

  def deprecated_stylesheet?
    @deprecated_stylesheet || false
  end

end
