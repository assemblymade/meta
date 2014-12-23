# TODO: (whatupdave) rename this to just Comment
class NewsFeedItemComment < ActiveRecord::Base
  belongs_to :news_feed_item, touch: true
  belongs_to :user

  has_many :hearts, as: :heartable
  has_many :tips, foreign_key: 'via_id'

  validates :body, presence: true
  validates :news_feed_item, presence: true

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

  def product
    news_feed_item.product
  end

  def author_id
    user_id
  end

  def url_params
    [news_feed_item.url_params, anchor: id]
  end

  def mentioned_users
    FindMentionedUsers.new.perform(body, news_feed_item.product) - [self.user]
  end

  def tip_receiver
    user
  end

  # don't call this directly, it will get called by the readraptor webhook
  def notify_by_email(user)
    CommentMailer.delay(queue: 'mailer').new_comment(user.id, self.id)
  end
end
