class InvitesController < ApplicationController
  respond_to :json

  before_action :authenticate_user!

  def create
    @invite = Invite.create_and_send(invite_params.merge(invitor: current_user))
    track_analytics(@invite)
    respond_with @invite, location: request.referer

    Karma::Kalkulate.new.karma_from_invite(@invite)

  end

  # private

  def invite_params
    params.require(:invite).permit(:username_or_email, :note, :tip_cents, :via_id, :via_type)
  end

  def track_analytics(invite)
    unless current_user.staff?
      track_event 'invite.sent', ProductAnalyticsSerializer.new(invite.product, scope: current_user).as_json
    end
  end

end
