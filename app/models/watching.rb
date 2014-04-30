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
    end
  end

  def self.unwatch!(user, watchable)
    where(user: user, watchable: watchable).delete_all
  end

  def self.watched?(user, watchable)
    where(user: user, watchable: watchable).any?
  end
end
