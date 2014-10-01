require 'activerecord/uuid'
require 'money'
require './lib/poster_image'
require 'elasticsearch/model'

class Product < ActiveRecord::Base
  include ActiveRecord::UUID
  include Kaminari::ActiveRecordModelExtension
  include Elasticsearch::Model
  include Workflow

  DEFAULT_BOUNTY_SIZE=10000
  PITCH_WEEK_REQUIRED_BUILDERS=10

  extend FriendlyId

  friendly_id :slug_candidates, use: :slugged

  alias_attribute :stage, :state

  attr_encryptor :wallet_private_key, :key => ENV["PRODUCT_ENCRYPTION_KEY"], :encode => true, :mode => :per_attribute_iv_and_salt, :unless => Rails.env.test?

  belongs_to :user
  belongs_to :evaluator, class_name: 'User'
  belongs_to :main_thread, class_name: 'Discussion'

  belongs_to :logo, class_name: 'Asset', foreign_key: 'logo_id'

  has_one :product_trend

  has_many :assets
  has_many :auto_tip_contracts
  has_many :chat_rooms
  has_many :completed_missions
  has_many :contract_holders
  has_many :core_team, through: :core_team_memberships, source: :user
  has_many :core_team_memberships, -> { where(is_core: true) }, class_name: 'TeamMembership'
  has_many :discussions
  has_many :event_activities, through: :events, source: :activities
  has_many :events, :through => :wips
  has_many :expense_claims
  has_many :financial_accounts, class_name: 'Financial::Account'
  has_many :financial_transactions, class_name: 'Financial::Transaction'
  has_many :invites, as: :via
  has_many :metrics
  has_many :milestones
  has_many :pitch_week_applications
  has_many :posts
  has_many :profit_reports
  has_many :rooms
  has_many :showcases
  has_many :status_messages
  has_many :stream_events
  has_many :subscribers
  has_many :tasks
  has_many :team_memberships
  has_many :transaction_log_entries
  has_many :votes, as: :voteable
  has_many :watchers, through: :watchings, source: :user
  has_many :watchings, as: :watchable
  has_many :wip_activities, through: :wips, source: :activities
  has_many :wips
  has_many :work

  scope :featured,         -> {
    where.not(featured_on: nil).order(featured_on: :desc)
  }
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
  scope :advertisable,     -> { where(can_advertise: true) }
  scope :latest,           -> { where(flagged_at: nil).order(updated_at: :desc)}
  scope :ordered_by_trend, -> { joins(:product_trend).order('product_trends.score DESC') }
  scope :public_products,  -> { where.not(slug: PRIVATE).where(flagged_at: nil).advertisable.where.not(state: ['stealth', 'reviewing']) }
  scope :repos_gt,         ->(count) { where('array_length(repos,1) > ?', count) }
  scope :since,            ->(time) { where('created_at >= ?', time) }
  scope :tagged_with_any,  ->(tags) { where('tags && ARRAY[?]::varchar[]', tags) }
  scope :validating,       -> { where(greenlit_at: nil) }
  scope :waiting_approval, -> { where('submitted_at is not null and evaluated_at is null') }
  scope :with_repo,        ->(repo) { where('? = ANY(repos)', repo) }
  scope :with_logo,        ->{ where.not(poster: nil).where.not(poster: '') }

  scope :stealth,      -> { where(state: 'stealth') }
  scope :teambuilding, -> { public_products.where(state: 'team_building') }
  scope :greenlit,     -> { public_products.where(state: 'greenlit') }
  scope :profitable,   -> { public_products.where(state: 'profitable') }

  validates :slug, uniqueness: { allow_nil: true }
  validates :name, presence: true,
                   length: { minimum: 2, maximum: 255 }
  validates :pitch, presence: true,
                    length: { maximum: 255 }

  before_create :generate_authentication_token

  after_commit -> { add_to_event_stream }, on: :create
  after_commit -> { Indexer.perform_async(:index, Product.to_s, self.id) }, on: :create

  after_update :update_elasticsearch


  serialize :repos, Repo::Github

  INITIAL_COINS = 6000
  PRIVATE = ((ENV['PRIVATE_PRODUCTS'] || '').split(','))
  NON_PROFIT = %w(meta)

  INFO_FIELDS = %w(goals key_features target_audience competing_products competitive_advantage monetization_strategy)

  store_accessor :info, *INFO_FIELDS.map(&:to_sym)

  workflow_column :state

  workflow do
    state :stealth do
      event :submit,
        transitions_to: :reviewing
    end

    state :reviewing do
      event :accept,
        transitions_to: :team_building

      event :reject,
        transitions_to: :stealth
    end

    state :team_building do
      event :greenlight,
        transitions_to: :greenlit
    end

    state :greenlit do
      event :launch,
        transitions_to: :profitable
    end

    state :profitable
  end

  class << self
    def unique_tags
      pluck('distinct unnest(tags)').sort_by{|t| t.downcase }
    end
  end

  def on_stealth_entry(prev_state, event, *args)
    update!(
      started_teambuilding_at: nil,
      greenlit_at: nil,
      profitable_at: nil
    )
  end

  def on_team_building_entry(prev_state, event, *args)
    update!(
      started_teambuilding_at: Time.now,
      greenlit_at: nil,
      profitable_at: nil
    )
  end

  def on_greenlit_entry(prev_state, event, *args)
    update!(
      greenlit_at: Time.now,
      profitable_at: nil
    )
  end

  def on_profitable_entry(prev_state, event, *args)
    update!(profitable_at: Time.now)
  end

  def wallet_private_key_salt
    # http://ruby-doc.org/stdlib-2.1.0/libdoc/openssl/rdoc/OpenSSL/Cipher.html#class-OpenSSL::Cipher-label-Encrypting+and+decrypting+some+data
    cipher = OpenSSL::Cipher::AES256.new(:CBC)
    cipher.encrypt
    cipher.random_key
  end

  def update_stage!(new_stage)
    case new_stage
    when 'profitable'
      launch!
    when 'greenlit'
      greenlight!
    when 'teambuilding'
      approve!
    when 'stealth'
      reject!
    end
  end

  def launched?
    !started_teambuilding_at.nil?
  end

  def stealth?
    started_teambuilding_at.nil?
  end

  def teambuilding?
    greenlit_at.nil? && started_teambuilding_at && started_teambuilding_at > 30.days.ago
  end

  def greenlit?
    !greenlit_at.nil? &&
      profitable_at.nil?
  end

  def profitable?
    !profitable_at.nil?
  end

  def stopped_teambuilding_at
    started_teambuilding_at + 30.days
  end

  def teambuilding_days_left
    [(stopped_teambuilding_at.to_date - Date.today).to_i, 0].max
  end

  def teambuilding_percentage
    [product.bio_memberships_count, 10].min * 10
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

  def partners
    entries = TransactionLogEntry.where(product_id: self.id).with_cents.group(:wallet_id).sum(:cents)
    User.where(id: entries.keys)
  end

  def partner_ids
    User.joins(:transaction_log_entries).
         where('transaction_log_entries.product_id' => id).
         group('users.id').pluck('users.id')
  end

  def has_metrics?
    for_profit?
  end

  def contributors(limit=10)
    User.where(id: (contributor_ids | [user_id])).take(limit)
  end

  def contributor_ids
    wip_creator_ids | event_creator_ids
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

  def finished_first_steps?
    posts.exists? && tasks.count >= 3 && repos.present?
  end

  def awaiting_approval?
    pitch_week_applications.to_review.exists?
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
    profit_reports.any?
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

  def count_contributors
    (wip_creator_ids | event_creator_ids).size
  end

  def event_creator_ids
    Event.joins(:wip).where('wips.product_id = ?', self.id).group('events.user_id').count.keys
  end

  def wip_creator_ids
    Wip.where('wips.product_id = ?', self.id).group('wips.user_id').count.keys
  end

  def submitted?
    !!submitted_at
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

  def main_chat_room
    chat_rooms.first || ChatRoom.general
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

  def voted_by?(user)
    votes.where(user: user).any?
  end

  def combined_watchers_and_voters
    (votes.map {|vote| vote.user } + watchers).uniq
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

  # following
  def watch!(user)
    transaction do
      Watching.watch!(user, self)
      Subscriber.unsubscribe!(self, user)
    end
  end

  # not following, will receive announcements
  def announcements!(user)
    transaction do
      Watching.unwatch!(user, self)
      Subscriber.upsert!(self, user)
    end
  end

  # not following
  def unwatch!(user)
    transaction do
      Watching.unwatch!(user, self)
      Subscriber.unsubscribe!(self, user)
    end
  end

  # only people following the product, ie. excludes people on announcements only
  def followers
    watchers
  end

  def follower_ids
    watchings.pluck(:user_id)
  end

  def followed_by?(user)
    Watching.following?(user, self)
  end

  def auto_watch!(user)
    Watching.auto_watch!(user, self)
  end

  def watching?(user)
    Watching.watched?(user, self)
  end

  def watching_state(user)
    if user
      if Watching.following?(user, self)
        return 'following'
      elsif subscribers.find_by(user_id: user.id)
        return 'announcements'
      end
    end

    'not watching'
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

  def average_bounty
    bounties = TransactionLogEntry.minted.
      where(product_id: product.id).
      where.not(work_id: product.id).
      group(:work_id).
      sum(:cents).values.reject(&:zero?)

    return DEFAULT_BOUNTY_SIZE if bounties.none?

    bounties.inject(0, &:+) / bounties.size
  end

  def ownership
    ProductOwnership.new(self)
  end

  def update_partners_count_cache
    self.partners_count = ownership.user_cents.size
  end

  def update_watchings_count!
    update! watchings_count: (subscribers.count + followers.count)
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

  def draft?
    self.description.blank? && (self.info || {}).values.all?(&:blank?)
  end

  def bounty_postings
    BountyPosting.joins(:bounty).where('wips.product_id = ?', id)
  end

  # elasticsearch
  def update_elasticsearch
    return unless (['name', 'pitch', 'description'] - self.changed).any?

    Indexer.perform_async(:index, Product.to_s, self.id)
  end

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

  def assign_key_pair!
    if key_pair = AssemblyCoins.get_key_pair
      update!(
        wallet_public_address: key_pair["public_address"],
        wallet_private_key: key_pair["private_key"]
      )
    end
  end

  protected

  def add_to_event_stream
    StreamEvent.add_create_event!(actor: user, subject: self)
  end
end
