 require 'activerecord/uuid'

class Watching < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :user
  belongs_to :watchable, polymorphic: true, counter_cache: true, touch: true

  validates :user,      presence: true, uniqueness: {scope: :watchable}
  validates :watchable, presence: true

  def self.watch!(user, watchable)
    # find_or_create_by! is broken
    unless where(user: user, watchable: watchable).exists?
      create!(user: user, watchable: watchable)
    else
      find_by(user_id: user.id, watchable_id: watchable.id).update_attributes(subscription: false)
    end
  end

  def self.unwatch!(user, watchable)
    where(user: user, watchable: watchable).delete_all
  end

  def self.watched?(user, watchable)
    where(user: user, watchable: watchable).any?
  end

  def self.subscribe!(user, watchable)
    if where(user: user, watchable: watchable).exists?
      find_by(user_id: user.id, watchable_id: watchable.id).update_attributes(subscription: true)
    else
      create!(user: user, watchable: watchable, subscription: true)
    end
  end

  def self.unsubscribe!(user, watchable)
    if where(user: user, watchable: watchable, subscription: true).exists?
      find_by(user_id: user.id, watchable_id: watchable.id).update_attributes(subscription: false)
    end
  end

  def self.subscribed?(user, watchable)
    where(user: user, watchable: watchable, subscription: true).any?
  end
end
