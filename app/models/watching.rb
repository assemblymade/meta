 require 'activerecord/uuid'

class Watching < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :user
  belongs_to :watchable, polymorphic: true, counter_cache: true, touch: true

  validates :user,      presence: true, uniqueness: {scope: :watchable}
  validates :watchable, presence: true

  scope :subscribed, -> { where(subscription: true) }

  def self.auto_subscribe!(user, watchable)
    return if auto_following?(user, watchable)

    # We can't fall back to watch! here because we need auto_subscribed_at
    # not to be overwritten on subsequent calls to watch!.
    if auto_subscription = find_by(user_id: user.id, watchable_id: watchable.id, auto_subscribed_at: nil)
        auto_subscription.update(subscription: true, auto_subscribed_at: Time.now)
    else
      auto_subscription = create!(
        user: user,
        watchable: watchable,
        subscription: true,
        auto_subscribed_at: Time.now
      )
    end

    auto_subscription
  end

  def self.watch!(user, watchable, subscription=true)
    if watching = find_by(user: user, watchable: watchable)
      watching.update(subscription: subscription, unwatched_at: nil)
    else
      watching = create!(user: user, watchable: watchable, subscription: subscription)
    end

    if subscription
      if is_product?(watchable)
        watch_wips!(user, watchable)
      end
    else
      if is_product?(watchable)
        unwatch_wips!(user, watchable)
      end
    end
    watching
  end

  def self.watch_wips!(user, watchable)
    Wip.where(product: watchable).each do |w|
      watch!(user, w)
    end
  end

  # FIXME: There needs to be a better way to autowatch wips without breaking watch!
  def self.auto_watch!(user, watchable)
    unless where(user: user, watchable: watchable).exists?
      create!(user: user, watchable: watchable, subscription: true)
    end
  end

  def self.unwatch!(user, watchable)
    if watching = find_by(user: user, watchable: watchable, unwatched_at: nil)
      watching.update!(subscription: false, unwatched_at: Time.now)
    end

    if watching && self.is_product?(watchable)
      unwatch_wips!(user, watchable)
    end
  end

  def self.unwatch_wips!(user, watchable)
    Wip.where(product: watchable).each do |w|
      unwatch!(user, w)
    end
  end

  def self.watched?(user, watchable)
    where(user: user, watchable: watchable, unwatched_at: nil).any?
  end

  def self.announcements!(user, watchable)
    watch!(user, watchable, false)
  end

  def self.following?(user, watchable)
    where(user: user, watchable: watchable, subscription: true, unwatched_at: nil).any?
  end

  def self.announcements?(user, watchable)
    where(user: user, watchable: watchable, subscription: false, unwatched_at: nil).any?
  end

  def self.auto_following?(user, watchable)
    where(user: user, watchable: watchable, unwatched_at: nil).where('auto_subscribed_at is not null').any?
  end

  def self.is_product?(watchable)
    watchable.class.to_s == "Product"
  end
end
