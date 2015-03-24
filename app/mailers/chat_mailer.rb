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

    scope = Event::Comment.where(wip_id: @event.wip_id)
    @previous_events = scope.order(created_at: :asc).where('created_at < ?', @event.created_at).limit(2)
    @future_event = scope.order(created_at: :asc).where('created_at > ?', @event.created_at).limit(1)
    @comments = (@previous_events + [@event, @future_event]).compact

    mailgun_tag 'mentions'

    @fun = 'You must be so popular'
    mail   to: @user.email,
      subject: "@#{@event.user.username} mentioned you in chat on ##{@chat_room.slug}"
  end
end
