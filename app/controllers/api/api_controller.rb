class Api::ApiController < ApplicationController
  respond_to :json
  skip_before_filter :verify_authenticity_token
  protect_from_forgery with: :null_session, if: Proc.new { |c| c.request.format == 'application/json' }

  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found
  rescue_from ActionController::RoutingError, with: :record_not_found

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

  def record_not_found(error)
    render json: {}, status: :not_found
  end
end
