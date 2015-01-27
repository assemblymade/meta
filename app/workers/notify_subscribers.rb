class NotifySubscribers
  include Rails.application.routes.url_helpers

  def perform(comment)
    nfi = comment.news_feed_item

    thread_subscriber_ids = (nfi.followers.reject(&:mail_never?).map(&:id) - [comment.user_id])
    product_subscriber_ids = nfi.product? ? (nfi.product.followers.reject(&:mail_never?).map(&:id) - thread_subscriber_ids - [comment.user_id]) : nil

    if thread_subscriber_ids.any?
      # webhook will call back in 1 minute if the comment hasn't been read
      ReadRaptor::RegisterArticleWorker.perform_async(
        key: ReadRaptorSerializer.serialize_entity(NewsFeedItemComment.to_s, comment.id),
        recipients: thread_subscriber_ids,
        via: [{
          type: 'webhook',
          at: 1.minutes.from_now.to_i,
          url: webhooks_readraptor_immediate_url(comment.id)
        }]
      )
    end

    if product_subscriber_ids.try(:any?)
      # the email tag and no callback means they will end up in the daily digest
      [nil, :email].each do |tag|
        ReadRaptor::RegisterArticleWorker.perform_async(
          key: ReadRaptorSerializer.serialize_entity(NewsFeedItemComment.to_s, comment.id, tag),
          recipients: product_subscriber_ids
        )
      end
    end
  end
end
