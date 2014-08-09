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

    watch!(user, watchable)
  end

  def self.watch!(user, watchable, subscription=true)
    if watching = find_by(user: user, watchable: watchable)
      watching.update_attributes subscription: subscription
    else
      watching = create!(user: user, watchable: watchable, subscription: subscription)
    end

    if subscription
      if is_product?(watchable)
        watch_wips!(user, watchable)
      end
    end
    watching
  end

  def self.watch_wips!(user, watchable)
    Wip.where(product: watchable).each do |w|
      self.watch!(user, w)
    end
  end

  # FIXME: There needs to be a better way to autowatch wips without breaking watch!
  def self.auto_watch!(user, watchable)
    unless where(user: user, watchable: watchable).exists?
      create!(user: user, watchable: watchable, subscription: true)
    end
  end

  def self.unwatch!(user, watchable)
    where(user: user, watchable: watchable).delete_all

    if self.is_product?(watchable)
      self.unwatch_wips!(user, watchable)
    end
  end

  def self.unwatch_wips!(user, watchable)
    Wip.where(product: watchable).each do |w|
      self.unwatch!(user, w)
    end
  end

  def self.watched?(user, watchable)
    where(user: user, watchable: watchable).any?
  end

  def self.announcements!(user, watchable)
    watch!(user, watchable, false)
  end

  def self.following?(user, watchable)
    where(user: user, watchable: watchable, subscription: true).any?
  end

  def self.announcements?(user, watchable)
    where(user: user, watchable: watchable, subscription: false).any?
  end

  def self.auto_following?(user, watchable)
    where(user: user, watchable: watchable, subscription: true).where('auto_subscribed_at is not null').any?
  end

  def self.is_product?(watchable)
    watchable.class.to_s == "Product"
  end
end
