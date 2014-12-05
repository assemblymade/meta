class SlackNotifier
  def self.notify(payload = {})
    SlackhookWorker.perform_async(payload)
  end

  def self.greet_user(username, action = nil)
    begin
      action ||= "completed their first activity"
      url = Rails.application.routes.url_helpers.chat_room_url(ChatRoom.find_by(slug: 'general'), message: "Hey @#{username}!")
      SlackhookWorker.perform_async({
        text: "I just #{action}. <#{url}|Greet me in general chat.>",
        username: username
        })
    rescue
      "Something went wrong"
    end
  end
end
