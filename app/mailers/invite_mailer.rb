class InviteMailer < BaseMailer
  layout 'email'

  def invited(invite_id)
    @invite = Invite.find(invite_id)
    @invitor = @invite.invitor
    @via = @invite.via
    @product = @via.product

    mail to: @invite.invitee_email || @invite.invitee.email,
         subject: "@#{@invitor.username} wants your help on Assembly"
  end
end