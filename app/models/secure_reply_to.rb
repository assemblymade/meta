require 'openssl'

class SecureReplyTo
  attr_reader :object_type, :object_id, :user_id

  def initialize(object_type, object_id, user_id)
    @object_type, @object_id, @user_id = object_type, object_id, user_id
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

  def to_s
    "reply+#{@object_type}+#{@object_id}+#{signature}+#{@user_id}@assemblymail.com"
  end
end