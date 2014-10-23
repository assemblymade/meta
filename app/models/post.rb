require 'activerecord/uuid'

class Post < ActiveRecord::Base
  include ActiveRecord::UUID
  include Kaminari::ActiveRecordModelExtension
  extend FriendlyId

  belongs_to :product
  belongs_to :author, class_name: 'User'

  has_many :news_feed_items, as: :target

  validates :product, presence: true
  validates :author,  presence: true
  validates :title,   uniqueness: true, presence: true
  validates :slug,    presence: true
  validates :summary, length: { minimum: 2, maximum: 140 }, allow_blank: true

  after_commit :push_to_news_feed, on: :create

  friendly_id :title, use: :slugged

  def summary
    super || body.split("\n").first
  end

  def follower_ids
    product.follower_ids
  end

  def flagged?
    flagged_at.present?
  end

  def push_to_news_feed
    NewsFeedItem.create_with_target(self)
  end

  def user
    author
  end

end
