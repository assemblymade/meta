class ReadraptorTracker
  attr_reader :article_id, :user_id, :token, :public_key

  def initialize(entity, user_id)
    @article_id = "#{entity.class}_#{entity.id}"
    @user_id = user_id
    @token = ENV['READRAPTOR_TOKEN']
    @public_key = ENV['READRAPTOR_PUBLIC']
  end

  def url
    sig = Digest::SHA1.hexdigest "#{token}#{public_key}#{article_id}#{user_id}"
    "#{ENV['READRAPTOR_URL']}/t/#{public_key}/#{article_id}/#{user_id}/#{sig}.gif"
  end
end
