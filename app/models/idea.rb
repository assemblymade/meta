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

  after_commit :update_news_feed_item

  scope :trending, -> { order(score: :desc) }
  scope :by, -> (user) { where(user_id: user.id) }
  scope :greenlit, -> { where.not(greenlit_at: nil) }
  scope :newness, -> { order(created_at: :desc) }
  scope :with_mark,  -> (name) { joins(:marks).where(marks: { name: name }) }
  scope :with_percentile, -> (percentile) {
    all.sort_by(&:percentile).
    take(percentile * all.count/100)
  }

  HEARTBURN = 30.days  # period for 100% inflation, equivalent to half-life
  EPOCH_START = Time.new(2013, 6, 6)

  def slug_candidates
    [
      :name,
      [:creator_username, :name],
    ]
  end

  def self.create_with_discussion(user, idea_params)
    transaction do
      idea = user.ideas.create(idea_params)
      idea.push_to_news_feed
      idea
    end
  end

  # this is for heart emails, but I think any 'thread' should have a title
  def title
    name
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
    if news_feed_item
      news_feed_item.update(updated_at: Time.now)
    end
  end

  def add_marks(mark_names)
    return false unless mark_names.is_a? Array
    if mark_names.reject(&:blank?).empty?
      return self.markings.destroy_all
    else
      mark_names.each do |mark_name|
        add_mark(mark_name)
      end
    end
  end

  def add_mark(mark_name)
    MakeMarks.new.mark_with_name(self, mark_name)
  end

  def love
    news_feed_item.hearts.count
  end

  def hearted
    save_score
  end

  def unhearted
    save_score
  end

  def save_score
    lovescore = score

    news_feed_item.hearts.where('created_at > ?', last_score_update).each do |h|
      time_since = h.created_at - EPOCH_START
      multiplier = 2 ** (time_since.to_f / HEARTBURN.to_f)
      lovescore = lovescore + multiplier
    end

    update!({
      last_score_update: DateTime.now,
      score: lovescore
    })
    lovescore
  end

  def url_params
    [self]
  end

  def rank
    Idea.where('score > ?', score).count + 1
  end

  def percentile
    self.rank.to_f / Idea.count * 100.round(2)
  end

  # Top percentile is 0, not 100
  def heart_distance_from_percentile(goal_percentile=20)
    index = (Idea.where(greenlit_at: nil).count * goal_percentile.to_f/100).to_i
    expected_score = Idea.order(score: :desc).limit(index == 0 ? 1 : index).last.score
    time_since = Time.now - EPOCH_START
    multiplier = 2 ** (time_since.to_f / HEARTBURN.to_f)
    hearts_missing = (expected_score - self.score) / (multiplier)
    hearts_missing = (hearts_missing + 0.999).to_i
  end

  def temperature
    100 - percentile
  end

end
