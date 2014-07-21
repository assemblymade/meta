class Users::SessionsController < Devise::SessionsController
  skip_before_action :validate_confirmed!, only: [:destroy]

  after_action :claim_invite, only: [:create]

  def show
    if signed_in?
      render json: current_user
    else
      render nothing: true, status: :unauthorized
    end
  end

  # private

  def claim_invite
    Invite.find(cookies[:invite]).claim!(resource) if self.resource && cookies[:invite]
  end
end
