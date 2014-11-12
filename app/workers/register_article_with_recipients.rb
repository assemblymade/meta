require 'core_ext/time_ext'

# This will register an article in readraptor which will deliver based on user's email preferences

class RegisterArticleWithRecipients
  include Sidekiq::Worker
  include Rails.application.routes.url_helpers

  attr_reader :recipients, :entity_id

  def perform(recipient_ids, tags, entity_type, entity_id)
    @recipients = User.find(recipient_ids)
    @tags = Array(tags)
    @entity_type = entity_type
    @entity_id = entity_id
    deliver!
  end

  def deliver!
    return unless ENV['READRAPTOR_URL']

    @recipients.group_by{|u| u.mail_preference }.each do |preference, recipients|
      @tags.each do |tag|
        opts = {
          key: ReadRaptorSerializer.serialize_entity(@entity_type, @entity_id, tag),
          recipients: recipients.map(&:id)
        }

        if callback = callbacks[preference]
          opts[:via] = [{
            type: 'webhook',
            at: callback['at'],
            url: callback['url']
          }]
        end

        ReadRaptor::RegisterArticleWorker.perform_async(opts)
      end
    end
  end

  def callbacks
    {
      'immediate' => {
        'at' => 30.seconds.from_now.to_i,
        'url' => webhooks_readraptor_immediate_url(entity_id),
      },
    }
  end
end
