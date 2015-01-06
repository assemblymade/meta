class ChatMailerPreview < ActionMailer::Preview
  def mentioned_in_chat
    begin
      @event = Event.uncached { Event.joins(wip: :chat_room).where("body ilike '% @core%'").order("Random()").first }
    end while @event.mentioned_users.size == 0

    user = @event.mentioned_users.first
    ChatMailer.mentioned_in_chat(user.id, @event.id)
  end
end
