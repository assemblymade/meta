 require 'activerecord/uuid'

class Watching < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :user
  belongs_to :watchable, polymorphic: true, touch: true

  validates :user,      presence: true, uniqueness:  { scope: :watchable }
  validates :watchable, presence: true

  default_scope -> { where(unwatched_at: nil) }

  after_commit -> { watchable.update_watchings_count! }

  def self.auto_watch!(user, watchable)
    return if where(user: user, watchable: watchable).where('auto_subscribed_at is not null').any?

    watch!(user, watchable, auto_watch_at=Time.now)
  end

  def self.watch!(user, watchable, auto_watch_at=nil)
    if watching = unscoped.find_by(user: user, watchable: watchable)
      watching.update(unwatched_at: nil, auto_subscribed_at: auto_watch_at)
    else
      watching = create!(user: user, watchable: watchable, auto_subscribed_at: auto_watch_at)
    end

    watching
  end

  def self.unwatch!(user, watchable)
    if watching = unscoped.find_by(user: user, watchable: watchable, unwatched_at: nil)
      watching.update!(unwatched_at: Time.now)
    end
  end

  def self.watched?(user, watchable)
    where(user: user, watchable: watchable, unwatched_at: nil).any?
  end

  def self.following?(user, watchable)
    where(user: user, watchable: watchable, unwatched_at: nil).any?
  end
end
