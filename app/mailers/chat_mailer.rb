class ChatMailer < BaseMailer
  helper :markdown
  helper :app_icon
  helper :firesize

  layout 'email_tile'

  def mentioned_in_chat(user_id, event_id, previous_events=nil)
    @user = User.find(user_id)
    @event = Event.find(event_id)
    @chat_room = @event.wip.chat_room
    @product = @chat_room.product

    @previous_events = @event.wip.comments.order(created_at: :desc).where('created_at < ?', @event.created_at).limit(2)
    @previous_events.to_a.reverse! if @previous_events
    @comments = @previous_events + [@event]

    mailgun_tag 'mentions'

    mail   to: @user.email,
      subject: "@#{@event.user.username} mentioned you in chat on ##{@chat_room.slug}"
  end
end
