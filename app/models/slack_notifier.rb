class SlackNotifier
  def self.post(payload = {})
    SlackhookWorker.perform_async(payload)
  end

  def self.first_activity(activity)
    return
    # return unless ["Chat", "Comment", "Post"].include?(activity.verb)
    # activity = SlackActivitySerializer.new(activity) rescue nil
    # return if activity.nil?
    # user = activity.object.actor
    # cta_link = activity.cta_link
    # action = activity.action
    # body = activity.body
    #
    # notify(
    #   user,
    #   action,
    #   cta_link,
    #   body
    # )
  end
end
