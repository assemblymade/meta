class ChatMailerPreview < ActionMailer::Preview
  def mentioned_in_chat


    room = ChatRoom.joins(wip: :events).sample
    event = room.wip.events.sample

    user = User.sample
    ChatMailer.mentioned_in_chat(user.id, event.id)
  end
end
