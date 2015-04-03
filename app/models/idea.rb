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
  after_commit :touch_news_feed_item, on: :update

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
  scope :recently_tilted, -> { joins(:product).unscope(where: :product_id).merge(Product.where('products.created_at > ?', 2.weeks.ago)).where.not(product_id: nil) }

  HEARTBURN = 30.days  # period for 100% inflation, equivalent to half-life
  EPOCH_START = Time.new(2013, 6, 6)

  DEFAULT_TILTING_THRESHOLD = 15
  COMMENT_MINIMUM = 5

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
      idea = user.ideas.create(idea_params)
      idea.push_to_news_feed
      user.touch
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

  def touch_news_feed_item
    if news_feed_item
      news_feed_item.touch
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

  def tiltable
    hearts = self.love >= DEFAULT_TILTING_THRESHOLD
    name = self.name.present? && (self.name != "Discuss potential names in the comments")
    comments = self.comments.count >= COMMENT_MINIMUM

    hearts && name && comments && !self.product_id.present?
  end

  def unhearted(heart)
    decrement_score(heart)
  end

  def checklist_state
    checklists = []
    checklists.append(ChecklistHandler.checklist_hearts_idea(idea))
    checklists.append(ChecklistHandler.checklist_name_idea(idea))
    checklists.append(ChecklistHandler.checklist_comments_idea(idea))
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

    if self.love == DEFAULT_TILTING_THRESHOLD
      send_tilt_email
    end
  end

  def send_tilt_email
    the_key = "tilt_notification_"+self.slug  + Time.now.strftime("%d%b%Y")
    recipient_id = self.user.id
    EmailLog.send_once(recipient_id, the_key) do
      TiltMailer.delay(queue: 'mailer').create(recipient_id, self.id)
    end
    self.update!({last_tilt_email_sent: DateTime.now})
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

  def score_multiplier
    time_since = Time.now - EPOCH_START
    multiplier = 2 ** (time_since.to_f / HEARTBURN.to_f)
  end

  # Top percentile is 0, not 100
  def heart_distance_from_percentile(goal_percentile=20)
    index = (Idea.where(greenlit_at: nil).count * goal_percentile.to_f/100).to_i

    if last_idea = Idea.order(score: :desc).limit(index == 0 ? 1 : index).last
      expected_score = last_idea.score
      hearts_missing = (expected_score - score) / score_multiplier
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
      lovescore = lovescore + score_multiplier
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

  def participants
    p = [self.user]
    self.news_feed_item.comments.each do |a|
      p.append(a.user)
    end
    self.news_feed_item.hearts.each do |b|
      p.append(b.user)
    end
    p.uniq
  end

end
