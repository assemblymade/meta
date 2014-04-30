require 'activerecord/uuid'

class Vote < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :voteable, polymorphic: true, counter_cache: true, touch: true
  belongs_to :user, touch: true

  validates :user,      presence: true
  validates :ip,        presence: true
  validates :voteable,  presence: true

  validate :cannot_have_more_votes_than_influence

  scope :by_user, ->(user) { where(user: user) }

  after_commit -> { track_activity }, on: :create

  def self.voted?(user, voteable)
    return false if user.nil?

    RedisCache.bool "users:#{user.id}:voted", voteable.id do
      Vote.where(user: user, voteable_id: voteable.id).any?
    end
  end

  def self.clear_cache(user, voteable)
    RedisCache.clear "users:#{user.id}:voted", voteable.id
  end

  def cannot_have_more_votes_than_influence
    if voteable.votes.by_user(user).size >= user.influence
      errors.add(:user, "can't have more votes than influence")
    end
  end

  def product
    voteable if voteable.is_a?(Product)
  end

  def track_activity
    if product
      StreamEvent.add_signup_event!(actor: user, subject: self, target: product)
    end
  end
end
