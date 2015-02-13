require 'activerecord/uuid'

class Post < ActiveRecord::Base
  include ActiveRecord::UUID
  include Kaminari::ActiveRecordModelExtension
  extend FriendlyId

  belongs_to :product
  belongs_to :author, class_name: 'User'

  has_one :news_feed_item, foreign_key: 'target_id'

  has_many :markings, as: :markable
  has_many :marks, through: :markings

  validates :product, presence: true
  validates :author,  presence: true
  validates :title,   uniqueness: { scope: :product_id }, presence: true
  validates :slug,    presence: true

  after_commit :mark_as_announcement, on: :create
  after_commit :push_to_news_feed, on: :create
  after_commit :update_news_feed_item

  friendly_id :title, use: :slugged

  scope :with_mark, -> (name) {
    joins(:marks).where(marks: { name: name })
  }

  scope :archived, -> {
    joins(:news_feed_item).where('news_feed_items.archived_at is not null')
  }

  scope :unarchived, -> {
    joins(:news_feed_item).where('news_feed_items.archived_at is null')
  }

  ANNOUNCEMENT_MARK = 'announcement'
  DISCUSSION_MARK = 'discussion'

  def self.filter_with_params(query, params)
    query = if params[:archived]
      query.archived
    else
      query.unarchived
    end

    if params[:announcements]
      query = query.with_mark('announcement')
    end

    if params[:discussions]
      query = query.with_mark('discussion')
    end

    query
  end

  def follower_ids
    product.follower_ids
  end

  def flagged?
    flagged_at.present?
  end

  def mark_as_announcement
    if product.core_team?(user)
      Marking.create!(markable: self, mark: Mark.find_or_create_by!(name: ANNOUNCEMENT_MARK), weight: 1.0)
    end
  end

  def mark_as_discussion
    Marking.create!(markable: self, mark: Mark.find_or_create_by!(name: DISCUSSION_MARK), weight: 1.0)
  end

  def mark_names
    marks.map(&:name)
  end

  def mark_names=(names)
    self.marks = Array.wrap(names).flatten.map do |n|
      raise "Cannot create an announcement" if n.strip == ANNOUNCEMENT_MARK && !product.core_team?(self.user)
      Mark.find_or_create_by!(name: n.strip)
    end
  end

  def push_to_news_feed
    NewsFeedItem.create_with_target(self)
  end

  def user
    author
  end

  def update_news_feed_item
    if self.news_feed_item
      self.news_feed_item.update(updated_at: Time.now)
    end
  end

  def url_params
    [product, self]
  end

end
