class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  before_action :store_location
  before_action :validate_confirmed!, if: :signed_in?
  before_action :strip_auth_token
  before_action :strip_invite_token
  before_action :strip_promo_token
  before_action :initialize_feature_flags
  before_action :process_pending_award

  after_action  :set_request_info!,   if: :signed_in?
  after_action  :claim_invite,        if: :signed_in?

  rescue_from CanCan::AccessDenied do |e|
    store_location
    if user_signed_in?
      redirect_to root_path
    else
      redirect_to new_user_session_path
    end
  end

  rescue_from ActionController::UnknownFormat, with: :raise_not_found

  helper_method :after_sign_up_path_for_user
  helper_method :after_sign_in_path_for_user

  protected

  def after_sign_up_path_for_user
    discover_path
  end

  def after_sign_out_path_for_user
    session[:previous_url] || root_path
  end

  def after_sign_in_path_for_user
    session[:previous_url] || dashboard_path(request.query_parameters)
  end

  def after_sign_in_path_for(resource)
    after_sign_in_path_for_user
  end

  def after_sign_up_path_for(resource)
    after_sign_up_path_for_user
  end

  def after_sign_out_path_for(resource)
    after_sign_out_path_for_user
  end


  def initialize_feature_flags
    @feature_flags ||= {}
  end

  def store_data(data)
    @stores ||= {}

    @stores.merge!(data)
  end

  def strip_auth_token
    if params[:auth_token].present? && request.headers['Content-Type'] != 'application/json'
      user = User.find_by!(authentication_token: params[:auth_token])
      sign_in user
      redirect_to(url_for(params.except(:auth_token)))
    end
  end

  def strip_promo_token
    if params[:assembly_assets_promotion].present?
      cookies.permanent[:assembly_assets_promotion] = true

      redirect_to(url_for(params.except(:assembly_assets_promotion)))
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

  def process_pending_award
    if token = (params[:token] || cookies[:award])
      if award = Award.find_by(token: token)
        if signed_in?
          award.claim!(current_user)
          cookies.delete(:award)
          redirect_to product_task_award_path(award.wip.product, award.wip, award)
        else
          cookies.permanent[:award] = award.token
          store_data(signup_form_store: {
            pending_award: AwardSerializer.new(award)
          })
        end
      end
    end
  end

  def claim_invite
    if cookies[:invite]
      if invite = Invite.find_by(id: cookies[:invite])
        invite.claim!(current_user)
        cookies.delete(:invite)
      end
    end
  end

  def validate_confirmed!
    redirect_to :edit_user_email unless current_user.confirmed?
  end

  def set_request_info!
    RequestInfo.perform_async current_user.id, Time.current, @product.try(:id)
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
    Analytics.track(
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

  def authenticate_staff!
    redirect_to(new_user_session_path) unless current_user.try(:staff?)
  end


  helper_method :log_trial_choose, :log_trial_complete

  def log_trial_choose(trial)
    Rails.logger.debug "experiment=%s alternative=%s user=%s" %
    [ trial.experiment.name, trial.alternative, current_user.try(:id) ]
  end

  def log_trial_complete(trial)
    Rails.logger.debug "experiment=%s alternative=%s user=%s complete=true" %
    [ trial.experiment.name, trial.alternative, current_user.try(:id) ]
  end

  def reject_blacklisted_users!
    if signed_in?
      if (ENV['BLACKLISTED_USERS'] || '').split(',').include?(current_user.username)
        raise 'Unauthorized'
      end
    end
  end

  def json_array(array, options={})
    ActiveModel::ArraySerializer.new(array, options)
  end
end
