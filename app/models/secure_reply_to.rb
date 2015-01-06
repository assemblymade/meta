require 'openssl'

class SecureReplyTo
  attr_reader :object_type, :object_id, :user_id

  def initialize(object_type, object_id, user_id)
    @object_type, @object_id, @user_id = object_type, object_id, user_id
    @object_type = @object_type.underscore # it gets downcased somewhere in the pipe
    @user_id = @user_id.downcase
    @secret = ENV['MAILGUN_API_KEY'] || 'assembly-secret'
  end

  def self.parse(address)
    _, object_type, object_id, signature, user_id = address.split(/[@\+]/)
    address = new(object_type, object_id, user_id)
    raise 'Invalid Signature' if address.signature != signature
    address
  end

  def signature
    digest = OpenSSL::Digest.new('sha1')
    data = [object_id, user_id].join
    OpenSSL::HMAC.hexdigest(digest, @secret, data)
  end

  def find_thread!
    # special case while mailgun clears out old emails
    if object_type.downcase == 'newsfeeditem'
      NewsFeedItem.find(object_id)
    # special case while we're creating Event::Comments on wips
    elsif object_type.downcase == 'wip'
      NewsFeedItem.find_by(target_id: object_id)
    else
      object_type.camelcase.constantize.find(object_id)
    end
  end

  def to_s
    "reply+#{@object_type}+#{@object_id}+#{signature}+#{@user_id}@assemblymail.com"
  end
end
