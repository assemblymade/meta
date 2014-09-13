class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  before_action :store_location
  before_action :validate_confirmed!, if: :signed_in?
  before_action :strip_auth_token,    if: :signed_in?
  before_action :strip_invite_token
  after_action  :set_request_info!,   if: :signed_in?

  rescue_from CanCan::AccessDenied do |e|
    store_location
    redirect_to new_user_session_path
  end

  rescue_from ActionController::UnknownFormat, with: :raise_not_found

  helper_method :after_sign_up_path_for_user
  helper_method :after_sign_in_path_for_user

  protected

  def after_sign_up_path_for_user
    session[:previous_url] || discover_path
  end

  def after_sign_out_path_for_user
    session[:previous_url] || root_path
  end

  def after_sign_in_path_for_user
    after_sign_up_path_for_user
  end


  def strip_auth_token
    unless request.headers['Content-Type'] == 'application/json'
      redirect_to(url_for(params.except(:auth_token))) if params[:auth_token].present?
    end
  end

  def strip_invite_token
    if params[:i].present?
      if invite = Invite.find_by(id: params[:i])
        if signed_in?
          invite.claim!(current_user)
        else
          cookies.permanent[:invite] = invite.id
        end
      end
      redirect_to(url_for(params.except(:i)))
    end
  end

  def validate_confirmed!
    redirect_to :edit_user_email unless current_user.confirmed?
  end

  def set_request_info!
    RequestInfo.enqueue current_user.id, Time.current.to_i, @product.try(:id)
  end

  def store_location
    ignored_locations = %w(/ /users/auth/facebook/callback /login /logout /signup /notifications.json)
    if (!request.xhr? &&
        !ignored_locations.include?(request.path) &&
        (request.format == "text/html" || request.content_type == "text/html"))
      session[:previous_url] = request.fullpath
    end
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

  # TODO remove these when we've removed WIPs
  def product_task_path(product, wip, options={})
    product_wip_path(product, wip, options)
  end
  def product_task_url(product, wip, options={})
    product_wip_url(product, wip, options)
  end

  around_filter :profile if Rails.env == 'development'

  def profile
    if params[:profile] && result = RubyProf.profile { yield }

      out = StringIO.new
      RubyProf::GraphHtmlPrinter.new(result).print out, :min_percent => 5
      # RubyProf::CallStackPrinter.new(result).print out, :min_percent => 0
      self.response_body = out.string

    else
      yield
    end
  end

  def raise_not_found
    render(text: 'Not Found', status: 404)
  end

end
