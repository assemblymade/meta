require 'core_ext/time_ext'

class ReadRaptorDelivery
  include Rails.application.routes.url_helpers

  attr_reader :recipients

  def initialize(recipients, tags=[])
    @recipients = recipients
    @tags = Array(tags)
  end

  def deliver_async(entity)
    return unless ENV['READRAPTOR_URL']

    recipients.group_by{|u| u.mail_preference }.each do |preference, recipients|
      @tags.each do |tag|
        opts = {
          key: ReadRaptorSerializer.serialize_entities(entity, tag).first,
          recipients: recipients.map(&:id)
        }

        if callback = callbacks[preference]
          opts[:via] = [{
            type: 'webhook',
            at: callback[:at],
            url: callback[:url]
          }]
        end

        ReadRaptor::RegisterArticleWorker.new.perform(opts)
      end
    end
  end

  def callbacks
    {
      'immediate' => {
        at: 30.seconds.from_now.to_i,
        url: webhooks_readraptor_immediate_url,
      },
    }
  end
end
