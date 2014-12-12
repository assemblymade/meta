class Idea < ActiveRecord::Base
  include ActiveRecord::UUID
  include Kaminari::ActiveRecordModelExtension

  extend FriendlyId

  friendly_id :slug_candidates, use: :slugged

  belongs_to :user
  has_many :markings, as: :markable
  has_many :marks, through: :markings
  has_one :news_feed_item, foreign_key: 'target_id'

  delegate :news_feed_item_comments, to: :news_feed_item

  validates :name, presence: true,
                   length: { minimum: 2, maximum: 255 }

  after_commit :push_to_news_feed, on: :create
  after_commit :update_news_feed_item

  scope :with_mark,  -> (name) { joins(:marks).where(marks: { name: name }) }
  scope :with_percentile, -> (percentile) { all.sort_by(&:percentile).take(percentile*all.count/100) }

  def slug_candidates
    [
      :name,
      [:creator_username, :name],
    ]
  end

  def comments
    news_feed_item.comments
  end

  def creator_username
    user.username
  end

  def push_to_news_feed
    NewsFeedItem.create_with_target(self)
  end

  def update_news_feed_item
    if self.news_feed_item
      self.news_feed_item.update(updated_at: Time.now)
    end
  end

  def add_marks(mark_names)
    return false unless mark_names.is_a? Array
    if mark_names.reject(&:blank?).empty?
      return self.markings.destroy_all
    else
      mark_names.each do |mark_name|
        self.add_mark(mark_name)
      end
    end
  end

  def add_mark(mark_name)
    MakeMarks.new.mark_with_name(self, mark_name)
  end

  def love
    self.news_feed_item.hearts.count
  end

  def save_score
    lovescore = self.score
    heartburn = 60.days.to_i  #period for 100% inflation, equivalent to half-life
    epoch_start = DateTime.new(2013,6,6).to_i

    self.news_feed_item.hearts.where('created_at > ?',self.last_score_update).each do |h|
      time_since = h.created_at.to_i - epoch_start
      multiplier = 2 ** (time_since.to_f / heartburn.to_f)
      lovescore = lovescore + multiplier
    end
    self.update!({last_score_update: DateTime.now, score: lovescore})
    lovescore
  end

  def historical_rank_contemporary
    Idea.order(score: :desc).find_index(self)+1
  end

  def percentile
    self.historical_rank_contemporary.to_f / Idea.count*100.round(2)
  end

end
