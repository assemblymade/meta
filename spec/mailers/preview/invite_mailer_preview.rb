class InviteMailerPreview < ActionMailer::Preview
  def invited
    InviteMailer.invited(Invite.sample)
  end

end
