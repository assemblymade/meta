# TODO: (whatupdave) rename this to just Comment
class NewsFeedItemComment < ActiveRecord::Base
  include Kaminari::ActiveRecordModelExtension

  belongs_to :news_feed_item, touch: true, counter_cache: :comments_count
  belongs_to :user, touch: true

  has_many :hearts, as: :heartable, after_add: :hearted
  has_many :tips, foreign_key: 'via_id'

  validates :body, presence: true
  validates :news_feed_item, presence: true

  default_scope -> { where(deleted_at: nil) }

  def self.publish_to_news_feed(target, event, body)
    if news_feed_item = NewsFeedItem.find_by(target: target)
      create!(
        body: body,
        target_id: event.id,
        news_feed_item: news_feed_item,
        user: event.user
      )
    end
  end

  def notify_subscribers!
    NotifySubscribers.new.perform(self)
  end

  def publish_activity!
    Activities::Comment.publish!(
      actor: user,
      subject: self,
      target: news_feed_item.target
    )
  end

  def track_acknowledgements!
    commenters = news_feed_item.comments.map(&:user).uniq
    mentionees = mentioned_users.uniq

    acknowledgees = (commenters + mentionees).reject(&:is_staff?) - [self.user]

    if acknowledgees.any?
      TrackAcknowledgements.perform_async(news_feed_item.to_global_id, acknowledgees.map(&:id))
    end
  end

  def product
    news_feed_item.product
  end

  def author_id
    user_id
  end

  def url_params
    [news_feed_item.url_params, anchor: id].flatten
  end

  def mentioned_users
    FindMentionedUsers.new.perform(body, news_feed_item.product) - [self.user]
  end

  def tip_added
    self.update!(tips_total: tips.sum(:cents))
  end

  def tip_receiver
    user
  end

  # don't call this directly, it will get called by the readraptor webhook
  def notify_by_email(user)
    CommentMailer.delay(queue: 'mailer').new_comment(user.id, self.id)
  end

  def hearted(heart)
    if !self.user.staff?
      TrackAcknowledgements.perform_async(news_feed_item.to_global_id, [self.user_id])
    end
  end

  def unhearted(heart)
  end

end
