class Api::ApiController < ApplicationController
  respond_to :json

  skip_before_action :verify_authenticity_token
  after_filter :strip_cookie

  rescue_from StandardError, with: :standard_error
  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found
  rescue_from ActionController::RoutingError, with: :record_not_found
  rescue_from ActionController::ParameterMissing, with: :bad_request
  rescue_from CanCan::AccessDenied, with: :access_denied

  def authenticate
    authenticate_with_http_token do |token, options|
      user = User.find_by(authentication_token: token)

      sign_in user if user
      true
    end
    authenticate_user!
  end

  def root
    render nothing: true, status: :ok
  end

  # private

  def access_denied
    render json: { message: "Access to this resource denied" }, status: :forbidden
  end

  def bad_request(error)
    render json: { message: "Invalid Request - #{error}" }, status: :bad_request
  end

  def record_not_found(error)
    render json: { message: "Not Found" }, status: :not_found
  end

  def standard_error(error)
    if Rails.env.production?
      render json: { message: "something broke. We're waking up our engineering team right now" }, status: :error
    else
      render json: {
        message: "#{error.class}: #{error.message}",
        backtrace: error.backtrace
      }, status: :error
    end
  end

  def strip_cookie
    request.session_options[:skip] = true
  end
end
