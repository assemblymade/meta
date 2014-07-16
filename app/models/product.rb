require 'activerecord/uuid'
require 'money'
require './lib/poster_image'
require 'elasticsearch/model'

class Product < ActiveRecord::Base
  include ActiveRecord::UUID
  include Kaminari::ActiveRecordModelExtension
  include Elasticsearch::Model

  extend FriendlyId

  friendly_id :slug_candidates, use: :slugged

  belongs_to :user
  belongs_to :evaluator, class_name: 'User'
  belongs_to :main_thread, class_name: 'Discussion'

  belongs_to :logo, class_name: 'Asset', foreign_key: 'logo_id'

  has_one :product_trend

  has_many :activities
  has_many :assets
  has_many :auto_tip_contracts
  has_many :completed_missions
  has_many :contract_holders
  has_many :core_team, through: :core_team_memberships, source: :user
  has_many :core_team_memberships, -> { where(is_core: true) }, class_name: 'TeamMembership'
  has_many :discussions
  has_many :event_activities, through: :events, source: :activities
  has_many :event_creators, -> { distinct }, :through => :events, source: :user
  has_many :events, :through => :wips
  has_many :financial_accounts, class_name: 'Financial::Account'
  has_many :financial_transactions, class_name: 'Financial::Transaction'
  has_many :invites, as: :via
  has_many :metrics
  has_many :milestones
  has_many :perks
  has_many :posts
  has_many :preorders, :through => :perks
  has_many :profit_reports
  has_many :rooms
  has_many :showcases
  has_many :status_messages
  has_many :stream_events
  has_many :subscribers, :through => :subscriptions, :source => :user
  has_many :subscriptions
  has_many :tasks
  has_many :team_memberships
  has_many :votes, :as => :voteable
  has_many :watchers, :through => :watchings, :source => :user
  has_many :watchings, :as => :watchable
  has_many :wip_activities, through: :wips, source: :activities
  has_many :wip_creators, -> { distinct }, :through => :wips, :source => :user
  has_many :wips
  has_many :work

  scope :featured,         -> {
    where.not(featured_on: nil).order(featured_on: :desc)
  }
  scope :approved,         -> { where(is_approved: true) }
  scope :created_in_month, ->(date) {
    where('date(products.created_at) >= ? and date(products.created_at) < ?',
      date.beginning_of_month, date.beginning_of_month + 1.month
    )
  }
  scope :created_in_week, ->(date) {
    where('date(products.created_at) >= ? and date(products.created_at) < ?',
      date.beginning_of_week, date.beginning_of_week + 1.week
    )
  }
  scope :declined,         -> { where(is_approved: false) }
  scope :greenlit,         -> { where('greenlit_at is not null') }
  scope :repos_gt,         ->(count) { where('array_length(repos,1) > ?', count) }
  scope :latest,           -> { where(flagged_at: nil).order(updated_at: :desc)}
  scope :launched,         -> { where.not(launched_at: nil) }
  scope :public_products,  -> { where.not(slug: PRIVATE).where(flagged_at: nil).where.not(launched_at: nil) }
  scope :since,            ->(time) { where('created_at >= ?', time) }
  scope :tagged_with_any,  ->(tags) { where('tags && ARRAY[?]::varchar[]', tags) }
  scope :validating,       -> { where(greenlit_at: nil) }
  scope :waiting_approval, -> { where('submitted_at is not null and evaluated_at is null') }
  scope :with_repo,        ->(repo) { where('? = ANY(repos)', repo) }
  scope :with_logo,        ->{ where.not(poster: nil).where.not(poster: '') }


  validates :slug, uniqueness: { allow_nil: true }
  validates :name, presence: true,
                   length: { minimum: 2, maximum: 255 }
  validates :pitch, presence: true,
                    length: { maximum: 255 }



  validates :terms_of_service, acceptance: true, on: :create

  before_create :generate_authentication_token
  after_update -> { CreateIdeaWipWorker.perform_async self.id }, :if => :submitted_at_changed?

  after_commit -> { subscribe_owner_to_notifications }, on: :create
  after_commit -> { add_to_event_stream }, on: :create
  after_commit -> { Indexer.perform_async(:index, Product.to_s, self.id) }

  serialize :repos, Repo::Github

  INITIAL_COINS = 6000
  PRIVATE = ((ENV['PRIVATE_PRODUCTS'] || '').split(','))
  NON_PROFIT = %w(meta)

  INFO_FIELDS = %w(goals key_features target_audience competing_products competitive_advantage monetization_strategy)

  store_accessor :info, *INFO_FIELDS.map(&:to_sym)

  class << self
    def find_by_id_or_slug!(id_or_slug)
      if id_or_slug.uuid?
        find_by!(id: id_or_slug)
      else
        find_by!(slug: id_or_slug)
      end
    end

    def unique_tags
      pluck('distinct unnest(tags)').sort_by{|t| t.downcase }
    end
  end

  def stage
    # TODO add shipping stage
    case
    when greenlit_at.nil?
      :validating
    else
      :building
    end
  end

  def launched?
    !launched_at.nil?
  end

  def stealth?
    launched_at.nil?
  end

  def founded_at
    read_attribute(:founded_at) || created_at
  end

  def public_at
    read_attribute(:public_at) || created_at
  end

  def for_profit?
    not NON_PROFIT.include?(slug)
  end

  def has_metrics?
    for_profit?
  end

  def has_preorders?
    for_profit?
  end

  # TODO: (whatupdave) challenge: make this 1 query
  def contributors(limit=10)
    (Array(user) + wip_creators.limit(limit) + event_creators.limit(limit)).uniq.take(limit)
  end

  def contributors_with_no_activity_since(since)
    contributors.select do |contributor|
      contributor.last_contribution.created_at < since
    end
  end

  def core_team?(user)
    return false if user.nil?
    team_memberships.core_team.active.find_by(user_id: user.id)
  end

  def member?(user)
    return false if user.nil?
    team_memberships.active.find_by(user_id: user.id)
  end

  def submit_for_approval!
    self.submitted_at = Time.now
    save!
  end

  def open_discussions?
    discussions.where(closed_at: nil).exists?
  end

  def open_discussions_count
    discussions.where(closed_at: nil).count
  end

  def open_tasks?
    wips.where(closed_at: nil).exists?
  end

  def revenue?
    slug == 'coderwall'
  end

  def open_tasks_count
    tasks.where(closed_at: nil).count
  end

  def voted_for_by?(user)
    user && user.voted_for?(self)
  end

  def number_of_code_tasks
    number_of_open_tasks(:code)
  end

  def number_of_design_tasks
    number_of_open_tasks(:design)
  end

  def number_of_copy_tasks
    number_of_open_tasks(:copy)
  end

  def number_of_other_tasks
    number_of_open_tasks(:other)
  end

  def number_of_open_tasks(deliverable_type)
    tasks.where(state: 'open', deliverable: deliverable_type).count
  end

  # TODO: (whatupdave) slowish...
  def count_contributors
    (wip_creators.pluck(:id) + event_creators.pluck(:id)).uniq.size
  end

  def submitted?
    !!submitted_at
  end

  def approve!(evaluator)
    evaluate!(true, evaluator)
  end

  def approved?
    is_approved
  end

  def decline!(evaluator)
    evaluate!(false, evaluator)
  end

  def evaluate!(approved, evaluator)
    self.evaluated_at = Time.now
    self.evaluator = evaluator
    self.is_approved = approved
    save!
  end

  def evaluated?
    !!evaluated_at
  end

  def greenlit?
    !greenlit_at.nil?
  end

  def flagged?
    !flagged_at.nil?
  end

  def feature!
    touch(:featured_on)
  end

  def count_presignups
    votes.select(:user_id).distinct.count
  end

  def slug_candidates
    [
      :name,
      [:creator_username, :name],
    ]
  end

  def creator_username
    user.username
  end

  def sum_preorders
    preorders.sum(:amount)
  end

  def total_banked
    sum_preorders + assembly_contribution
  end

  def voted_by?(user)
    votes.where(user: user).any?
  end

  def preorders_by_user(user)
    preorders.find_by(user: user)
  end

  def count_registered_users
    votes.size + preorders.size
  end

  def combined_watchers_and_voters
    (votes.map {|vote| vote.user } + watchers).uniq
  end

  def score
    votes.size + sum_preorders.dollars.to_i + assembly_contribution.dollars.to_i
  end

  def tags_with_count
    Wip::Tag.joins(:taggings => :wip).
        where('wips.closed_at is null').
        where('wips.product_id' => self.id).
        group('wip_tags.id').
        order('count(*) desc').
        count('*').map do |tag_id, count|
      [Wip::Tag.find(tag_id), count]
    end
  end

  def to_param
    slug || id
  end

  def watch!(user)
    Watching.watch!(user, self)
  end

  def unwatch!(user)
    Watching.unwatch!(user, self)
  end

  def watching?(user)
    Watching.watched?(user, self)
  end

  def poster_image
    self.logo || PosterImage.new(self)
  end

  def generate_authentication_token
    loop do
      self.authentication_token = Devise.friendly_token
      break authentication_token unless Product.find_by(authentication_token: authentication_token)
    end
  end

  def product
    self
  end

  # missions
  def current_mission
    ProductMission.next_mission_for_product(self)
  end

  def tags_string
    tags.join(', ')
  end

  def tags_string=(new_tags_string)
    self.tags = new_tags_string.split(', ')
  end

  def assembly?
    slug == 'asm'
  end

  def meta?
    slug == 'meta'
  end

  def upvote!(user, ip)
    votes.create!(user: user, ip: ip)
    watch!(user)
    main_thread.watch!(user) if main_thread
    TransactionLogEntry.voted!(Time.current, self, self.id, user.id, 1)
  end

  def draft?
    self.description.blank? && (self.info || {}).values.all?(&:blank?)
  end

  # elasticsearch
  mappings do
    indexes :name, type: 'multi_field' do
      indexes :name
      indexes :raw, analyzer: 'keyword'
    end

    indexes :pitch,       analyzer: 'snowball'
    indexes :description, analyzer: 'snowball'
    indexes :tech,        analyzer: 'keyword'
  end

  def as_indexed_json(options={})
    as_json(root: false, methods: [:tech, :hidden, :sanitized_description], only: [:slug, :name, :pitch, :poster])
  end

  def tech
    Search::TechFilter.matching(tags).map(&:slug)
  end

  def poster_image_url
    unless self.logo.nil?
      self.logo.url
    else
      PosterImage.new(self).url
    end
  end

  def hidden
    PRIVATE.include?(slug) || flagged?
  end

  def flagged?
    !!flagged_at
  end

  def sanitized_description
    description && Search::Sanitizer.new.sanitize(description)
  end

  # pusher

  def push_channel
    slug
  end

  protected

  def subscribe_owner_to_notifications
    subscriptions.create!(user: user)
  end

  def add_to_event_stream
    StreamEvent.add_create_event!(actor: user, subject: self)
  end
end
