class ChatMailer < BaseMailer
  helper :markdown

  def mentioned_in_chat(user_id, event_id)
    @user = User.find(user_id)
    @event = Event.find(event_id)
    @chat_room = @event.wip.chat_room

    mailgun_tag 'mentions'

    mail   to: @user.email,
      subject: "@#{@event.user.username} mentioned you in chat on ##{@chat_room.slug}"
  end
end
