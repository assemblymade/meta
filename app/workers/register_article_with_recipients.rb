require 'core_ext/time_ext'

class RegisterArticleWithRecipients
  include Sidekiq::Worker
  include Rails.application.routes.url_helpers

  def perform(gid, tags=[])
    deliver!(GlobalID::Locator.locate(gid), Array(tags))
  end

  def deliver!(article, tags)
    immediate_recipient_ids = article.immediate_notification_users.map(&:id) - [article.user_id]
    delayed_recipient_ids = article.follower_ids - [article.user_id]

    tags.each do |tag|
      options = {
        key: ReadRaptorSerializer.serialize_entity(article.class.to_s, article.id, tag),
        recipients: delayed_recipient_ids
      }

      if immediate_recipient_ids.any?
        options[:via] = [{
          type: 'webhook',
          at: 30.seconds.from_now.to_i,
          recipients: immediate_recipient_ids,
          url: webhooks_readraptor_immediate_url
        }]
      end

      return unless ENV['READRAPTOR_URL']
      ReadRaptor::RegisterArticleWorker.perform_async(options)
    end
  end
end
