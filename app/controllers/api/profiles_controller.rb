class Api::ProfilesController < ApiController
  before_action :doorkeeper_authorize! # Require access token for all actions

  def show
    render json: current_user, serializer: UserSerializer
  end

  private

  # Find the user that owns the access token
  def current_user
    User.find(doorkeeper_token.resource_owner_id) if doorkeeper_token
  end
end
