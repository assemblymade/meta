class SlackNotifier
  def self.post(payload = {})
    SlackhookWorker.perform_async(payload)
  end

  def self.notify(user, action = nil, cta_link = nil)
    begin
      if user.instance_of?(User)
        icon_url = user.avatar.url.to_s
        user = user.username
      end
      action ||= "completed their first activity"
      url = Rails.application.routes.url_helpers.chat_room_url(
              ChatRoom.find_by(slug: 'general'), 
              message: "Hey @#{user}!"
            )
      cta_link ||= "<#{url}|Greet me in general chat.>"
      payload = {
        text: "I just #{action} #{cta_link}",
        username: user
      }
      payload.merge!({icon_url: icon_url}) if icon_url.present?
      SlackhookWorker.perform_async(payload)
    rescue
      "Something went wrong"
    end
  end

  def self.first_story(user, activity)
    url = SlackActivitySerializer.new(activity).url
    cta_link = "<#{url}|See what's up.>"

    notify(
      user, 
      "created my first #{activity.verb}.",
      cta_link)
  end

  def self.first_chat_message(user, chat_room_slug)
    url = Rails.application.routes.url_helpers.chat_room_url(
            ChatRoom.find_by(slug: 'general'), 
            message: "Hey @#{user.username}!"
          )
    cta_link = "<#{url}|Greet me in #{chat_room_slug.titleize} chat.>"

    notify(
      user, 
      "posted my first chat message.",
      cta_link)
  end
end
