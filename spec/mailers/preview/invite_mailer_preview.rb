class InviteMailerPreview < ActionMailer::Preview
  def invited_by_email
    InviteMailer.invited(Invite.where('invitee_email is not null').sample)
  end

  def invited_by_username
    InviteMailer.invited(Invite.where('invitee_email is null').sample)
  end

  def invited_to_core_team
    InviteMailer.invited(Invite.where("extra ? 'core_team'").sample)
  end

end
