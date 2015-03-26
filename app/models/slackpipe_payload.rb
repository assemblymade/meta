class SlackpipePayload
  def self.deploy!(body={})
    return unless ENV['SLACKPIPE_SECRET']
    timestamp = Time.now.to_i
    payload = Hash[body[:message].sort_by(&:first)].to_json
    prehash = "#{timestamp}#{payload}"
    secret = Base64.decode64(ENV['SLACKPIPE_SECRET'])
    hash = OpenSSL::HMAC.digest('sha256', secret, prehash)
    signature = Base64.encode64(hash)

    SlackpipeWorker.perform_async(body.merge({auth: {signature: signature, timestamp: timestamp}}))
  end
end
