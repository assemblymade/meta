class Idea < ActiveRecord::Base
  include ActiveRecord::UUID
  include Kaminari::ActiveRecordModelExtension

  extend FriendlyId

  friendly_id :slug_candidates, use: :slugged

  belongs_to :product
  belongs_to :user

  has_many :markings, as: :markable
  has_many :marks, through: :markings
  has_one :news_feed_item, foreign_key: 'target_id'

  delegate :news_feed_item_comments, to: :news_feed_item

  validates :name, presence: true,
                   length: { minimum: 2, maximum: 255 },
                   exclusion: { in: Product::EXCLUSIONS }
  validates :tilting_threshold, presence: true
  validate :idea_and_product_have_same_user

  before_validation :set_tilting_threshold!, on: :create

  after_commit :ensure_news_feed_item, on: :create
  after_commit :update_news_feed_item, on: :update

  default_scope -> { where(deleted_at: nil) }

  scope :by, -> (user) { where(user_id: user.id) }
  scope :hearts, -> { includes(:news_feed_item).order('news_feed_items.hearts_count DESC') }
  scope :greenlit, -> { where.not(greenlit_at: nil) }
  scope :newness, -> { order(created_at: :desc) }
  scope :trending, -> { order(score: :desc) }
  scope :with_mark,  -> (name) { joins(:marks).where(marks: { name: name }) }
  scope :with_percentile, -> (percentile) {
    all.sort_by(&:percentile).
    take(percentile * all.count/100)
  }
  scope :with_topic, -> (topic) { where("? = ANY(topics)", topic) }

  HEARTBURN = 30.days  # period for 100% inflation, equivalent to half-life
  DEFAULT_TILTING_THRESHOLD = 10
  COMMENT_MINIMUM = 5
  EPOCH_START = Time.new(2013, 6, 6)

  CATEGORY_NAMES = [
    "Ideas searching for names",
    "Fresh ideas discussing strategy"
  ]

  CATEGORY_SLUGS = CATEGORY_NAMES.map { |name| name.downcase.gsub(/ /, "-") }

  TOPIC_NAMES = [
    "Art & Design",
    "Education",
    "Entertainment & Games",
    "Family & Lifestyle",
    "Mobile",
    "Productivity & Tools",
    "SaaS",
    "Social"
  ]

  TOPIC_SLUGS = TOPIC_NAMES.map { |name| name.downcase.gsub(/ /, "-") }

  def slug_candidates
    [
      :name,
      [:creator_username, :name],
    ]
  end

  def idea_and_product_have_same_user
    if product
      user == product.user
    else
      true
    end
  end

  def self.create_with_discussion(user, idea_params)
    idea = transaction do
      puts idea_params
      idea = user.ideas.create(idea_params)

      idea.push_to_news_feed
      idea
    end
  end

  def ensure_news_feed_item
    push_to_news_feed if news_feed_item.nil?
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
        self.add_mark(mark_name)
      end
    end
  end

  def add_mark(mark_name)
    MakeMarks.new.mark_with_name(self, mark_name)
  end

  def mark_names
    marks.map(&:name)
  end

  def mark_names=(names)
    self.marks = Array.wrap(names).flatten.map do |n|
      Mark.find_or_create_by!(name: n.strip)
    end
  end

  def greenlight!
    update(greenlit_at: Time.now)
    send_greenlit_notifications
  end

  def should_greenlight?
    hearts_count >= tilting_threshold
  end

  def send_greenlit_notifications
    # no-op for now
  end

  def love
    self.news_feed_item.hearts.count
  end

  def hearted
    add_score
  end

  def unhearted(heart)
    decrement_score(heart)
  end

  def checklist_state
    checklists = []
    hearts = {}
    hearts['title'] = "Get some love"
    hearts['editable'] = false
    hearts['state'] = self.love >= DEFAULT_TILTING_THRESHOLD
    if hearts['state']
      hearts['smalltext'] = self.love.to_s + " hearts"
    else
      hearts['smalltext'] = self.love.to_s + " / "+DEFAULT_TILTING_THRESHOLD.to_s+" hearts"
    end
    checklists.append(hearts)

    name = {}
    name['title'] = "Pick a name"
    if self.tentative_name
      name['smalltext'] = self.tentative_name
      name['state'] = true
    else
      name['state'] = false
      name['smalltext'] = "Unnamed"
    end
    name['editable'] = true
    name['editable_type'] = 'tentative_name'
    name['editable_button_text'] = "Name it"
    checklists.append(name)

    comments = {}
    comments['title'] = "Get feedback"
    comment_n = self.comments.count
    comments['state'] = comment_n >= COMMENT_MINIMUM
    comments['smalltext'] = comment_n.to_s + " comments"
    comments['editable'] = false
    checklists.append(comments)

    checklists
  end

  def add_score
    lovescore = self.score

    news_feed_item.hearts.where('created_at > ?', last_score_update).each do |h|
      time_since = h.created_at - EPOCH_START
      multiplier = 2 ** (time_since.to_f / HEARTBURN.to_f)
      lovescore = lovescore + multiplier
    end

    update!({
      last_score_update: DateTime.now,
      score: lovescore
    })

    greenlight! if should_greenlight?
  end

  def decrement_score(heart)
    time_since = heart.created_at - EPOCH_START
    love_lost = 2 ** (time_since.to_f / HEARTBURN.to_f)
    lovescore = self.score - love_lost
    update!({last_score_update: DateTime.now,
      score: lovescore})
  end

  def url_params
    [self]
  end

  def rank
    # Scores are being stored as double precision floats in PG but
    # Rails doesn't send through the correct precision float. Adding the
    # Epsiilon helps differentiate the scores.
    Idea.where(greenlit_at: nil, flagged_at: nil, deleted_at: nil)
        .where('score > ?', score + 0.00000001)
        .count + 1
  end

  def percentile
    rank.to_f / Idea.count * 100.round(2)
  end

  def set_tilting_threshold!
    return unless tilting_threshold.nil?

    threshold = heart_distance_from_percentile
    previous_threshold = Idea.order(created_at: :desc)
                             .limit(1)
                             .first
                             .try(:tilting_threshold)

    if threshold < previous_threshold.to_i
      threshold = previous_threshold.to_i
    end

    threshold = DEFAULT_TILTING_THRESHOLD if threshold < DEFAULT_TILTING_THRESHOLD

    update(tilting_threshold: threshold)
  end

  # Top percentile is 0, not 100
  def heart_distance_from_percentile(goal_percentile=20)
    index = (Idea.where(greenlit_at: nil).count * goal_percentile.to_f/100).to_i

    if last_idea = Idea.order(score: :desc).limit(index == 0 ? 1 : index).last
      expected_score = last_idea.score
      time_since = Time.now - EPOCH_START
      multiplier = 2 ** (time_since.to_f / HEARTBURN.to_f)
      hearts_missing = (expected_score - score) / multiplier
      (hearts_missing + 0.999).to_i
    else
      DEFAULT_TILTING_THRESHOLD
    end
  end

  def hearts_count
    news_feed_item.hearts_count
  end

  def reconstitute_score
    lovescore = 0

    news_feed_item.hearts.each do |h|
      time_since = h.created_at - EPOCH_START
      multiplier = 2 ** (time_since.to_f / HEARTBURN.to_f)
      lovescore = lovescore + multiplier
    end

    update!({
      last_score_update: DateTime.now,
      score: lovescore
    })
  end

  def twitter_description
    if self.body
      self.body.truncate(199)
    else
      ''
    end
  end

  def twitter_title
    self.name.truncate(69)
  end

  def tweet_creation
    Tweeter.new.tweet_idea(self)
  end

end
