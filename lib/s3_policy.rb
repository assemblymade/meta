class S3Policy
  def initialize(key, content_type)
    @key = key
    @content_type = content_type
  end

  def signature
    @signature ||= Base64.encode64(
      OpenSSL::HMAC.digest(
        OpenSSL::Digest.new('sha1'),
        ENV['AWS_SECRET_ACCESS_KEY'] || 'secret-key',
        policy
      )
    ).gsub(/\n/, '')
  end


  def policy
    @policy ||= Base64.encode64(
      {
        expiration: 30.minutes.from_now.utc.iso8601,
        conditions: [
          { bucket: ENV['ATTACHMENT_BUCKET'] || 'attachment-bucket' },
          { acl: 'public-read' },
          { 'cache-control' => "max-age=31557600" },
          { 'Content-Type' => @content_type},
          [ 'starts-with', '$key', 'attachments/'],
        ]
      }.to_json
    ).gsub(/\n|\r/, '')
  end

  def form
    @form ||= {
      'key' => @key,
      'acl' => 'public-read',
      'AWSAccessKeyId' => ENV['AWS_ACCESS_KEY_ID'] || 'access-key',
      'Cache-Control' => "max-age=31557600",
      'Content-Type' => @content_type,
      'policy' => policy,
      'signature' => signature,
    }
  end
end