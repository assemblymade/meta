class DeliverUnreadEmail
  include Sidekiq::Worker
  sidekiq_options queue: 'mailer'

  # retrieve unread email from readraptor and mark as read
  def perform(user_id)
    user = User.find(user_id)
    client = ReadRaptorClient.new

    # TODO: Ugh. This is failing randomly in ReadRaptor
    unread_article_ids = []
    retries = 0
    begin
      unread_article_ids = client.undelivered_articles(user.id)
    rescue IOError
      retry if (retries += 1) < 10
      raise
    end

    unread_articles = ReadRaptorSerializer.deserialize(unread_article_ids)

    return if unread_articles.empty?

    unread_articles.each do |entity|
      client.get(ReadraptorTracker.new(ReadRaptorSerializer.serialize_entities(entity, :email).first, user.id).url)
    end

    UnreadMailer.unread_content(user.id, unread_article_ids).deliver
  end
end
