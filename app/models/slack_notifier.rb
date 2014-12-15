class SlackNotifier
  def self.post(payload = {})
    SlackhookWorker.perform_async(payload)
  end

  def self.notify(user, action = nil, cta_link = nil, extra_content = nil)
    begin
      if user.instance_of?(User)
        icon_url = user.avatar.url.to_s
        user = user.username
      end
      action ||= "completed my first activity"
      url = Rails.application.routes.url_helpers.chat_room_url(
              ChatRoom.find_by(slug: 'general'), 
              message: "Hey @#{user}!"
            )
      cta_link ||= "<#{url}|Greet me in general chat.>"
      payload = {
        text: "I just #{action} #{cta_link}" + "\n>#{extra_content}",
        username: user
      }
      payload.merge!({icon_url: icon_url}) if icon_url.present?
      SlackhookWorker.perform_async(payload) unless Rails.env.development?
    rescue
      "Something went wrong"
    end
  end

  def self.first_activity(activity)
    return unless ["Chat", "Comment", "Post"].include?(activity.verb)
    activity = SlackActivitySerializer.new(activity)
    user = activity.object.actor
    cta_link = activity.cta_link
    action = activity.action
    body = activity.body

    notify(
      user,
      action,
      cta_link,
      body
    )
  end
end
