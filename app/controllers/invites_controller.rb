class InvitesController < ApplicationController
  respond_to :json

  before_action :authenticate_user!

  def create
    @invite = Invite.create(invite_params.merge(invitor: current_user))
    respond_with @invite, location: request.referer
  end

  def invite_params
    params.require(:invite).permit(:username_or_email, :note, :tip_cents, :via_id, :via_type)
  end
end
