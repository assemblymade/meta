require 'openssl'

class Webhooks::MailgunController < WebhookController
  before_filter :verify_webhook

  def create
    params['recipient']
    case params['event']
    when 'dropped', 'bounced'
      failed(params)
    end

    render nothing: true, status: 200
  end

  def reply
    process_reply

    render nothing: true, status: 200
  end

  def failed(params)
    user = User.find_by!(email: params.fetch(:recipient))
    user.email_failed_at!(Time.parse(params.fetch(:timestamp)))
  end

# private

  def verify_webhook
    if not secure?(ENV['MAILGUN_API_KEY'], params.fetch(:token), params.fetch(:timestamp), params.fetch(:signature))
      render nothing: true, status: 403
    end
  end

  def secure?(api_key, token, timestamp, signature)
    digest = OpenSSL::Digest.new('sha256')
    data = [timestamp, token].join
    signature == OpenSSL::HMAC.hexdigest(digest, api_key, data)
  end

  def process_reply
    if reply_to = params['To']
      address = SecureReplyTo.parse(reply_to)

      user = User.find_by(username: address.user_id)
      thread_entity = address.object_type.constantize.find(address.object_id)

      if user && thread_entity
        thread_entity.comments.create!(user: user, body: params['stripped-text'])
        thread_entity.try(:publish_activity!)
        thread_entity.try(:notify_subscribers!)
      end
    end
  end
end
