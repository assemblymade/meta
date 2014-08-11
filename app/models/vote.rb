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

  def cannot_have_more_votes_than_influence
    if voteable.votes.by_user(user).size >= user.influence
      errors.add(:user, "can't have more votes than influence")
    end
  end

  def product
    voteable if voteable.is_a?(Product)
  end
end
