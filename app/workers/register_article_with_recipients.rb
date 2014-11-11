require 'core_ext/time_ext'

class RegisterArticleWithRecipients
  include Sidekiq::Worker
  include Rails.application.routes.url_helpers

  attr_reader :recipients

  def perform(recipient_ids, tags, entity_type, entity_id, callback=nil)
    @recipients = User.find(recipient_ids)
    @tags = Array(tags)
    @entity_type = entity_type
    @entity_id = entity_id
    @callback = callback
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

        callback = @callback || callbacks[preference]

        if callback
          opts[:via] = [{
            type: 'webhook',
            at: callback['at'],
            url: callback['url']
          }]
        end

        puts "RegisterArticleWithRecipients #{callback.inspect} #{opts.inspect}"


        ReadRaptor::RegisterArticleWorker.perform_async(opts)
      end
    end
  end

  def callbacks
    {
      'immediate' => {
        'at' => 30.seconds.from_now.to_i,
        'url' => webhooks_readraptor_immediate_url,
      },
    }
  end
end
