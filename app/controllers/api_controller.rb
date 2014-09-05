class ApiController < ApplicationController
  respond_to :json
  skip_before_filter :verify_authenticity_token
  protect_from_forgery with: :null_session, if: Proc.new { |c| c.request.format == 'application/json' }

  def authenticate
    authenticate_with_http_token do |token, options|
      user = User.find_by(authentication_token: token)

      sign_in user if user
      true
    end
    authenticate_user!
  end
end
