class PushMention
  include Sidekiq::Worker

  def perform(user_id, socket_id, tag, title, body, icon, url)
    user = User.find(user_id)
    PusherWorker.new.perform("@#{user.username}", 'mentioned', {
        tag: tag,
        title: title,
        body: body,
        icon: icon,
        url: url
      }, socket_id: socket_id)
  end

  def self.push(user_id, socket_id, title, comment, url)
    PushMention.perform_async(
      user_id,
      socket_id,
      comment.id,
      title,
      comment.body.truncate(140),
      comment.product.try(:full_logo_url),
      url
    )
  end
end
