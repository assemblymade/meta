require 'activerecord/uuid'
require 'money'
require './lib/poster_image'
require 'elasticsearch/model'

class Product < ActiveRecord::Base
  include ActiveRecord::UUID
  include Kaminari::ActiveRecordModelExtension
  include Elasticsearch::Model
  include GlobalID::Identification
  include Workflow

  DEFAULT_BOUNTY_SIZE=10000
  PITCH_WEEK_REQUIRED_BUILDERS=10
  DEFAULT_IMAGE_PATH='/assets/app_icon.png'
  MARK_SEARCH_THRESHOLD=0.10

  extend FriendlyId

  friendly_id :slug_candidates, use: :slugged

  attr_encryptor :wallet_private_key, :key => ENV["PRODUCT_ENCRYPTION_KEY"], :encode => true, :mode => :per_attribute_iv_and_salt, :unless => Rails.env.test?

  belongs_to :user
  belongs_to :evaluator, class_name: 'User'
  belongs_to :main_thread, class_name: 'Discussion'
  belongs_to :logo, class_name: 'Asset', foreign_key: 'logo_id'

  has_one :product_trend
  has_one :idea

  has_many :activities
  has_many :assets
  has_many :auto_tip_contracts
  has_many :chat_rooms
  has_many :contract_holders
  has_many :core_team, through: :core_team_memberships, source: :user
  has_many :core_team_memberships, -> { where(is_core: true) }, class_name: 'TeamMembership'
  has_many :daily_metrics
  has_many :discussions
  has_many :domains
  has_many :event_activities, through: :events, source: :activities
  has_many :events, :through => :wips
  has_many :expense_claims
  has_many :financial_accounts, class_name: 'Financial::Account'
  has_many :financial_transactions, class_name: 'Financial::Transaction'
  has_many :integrations
  has_many :invites, as: :via
  has_many :markings, as: :markable
  has_many :marks, through: :markings
  has_many :milestones
  has_many :monthly_metrics
  has_many :news_feed_items
  has_many :news_feed_item_posts
  has_many :pitch_week_applications
  has_many :posts
  has_many :profit_reports
  has_many :proposals
  has_many :rooms
  has_many :screenshots, through: :assets
  has_many :showcase_entries
  has_many :showcases, through: :showcase_entries
  has_many :status_messages

  has_many :stream_events
  has_many :subscribers
  has_many :tasks
  has_many :team_memberships
  has_many :transaction_log_entries
  has_many :viewings, as: :viewable
  has_many :votes, as: :voteable
  has_many :watchers, through: :watchings, source: :user
  has_many :watchings, as: :watchable
  has_many :weekly_metrics
  has_many :wip_activities, through: :wips, source: :activities
  has_many :wips
  has_many :work
  has_many :ownership_statuses

  PRIVATE = ((ENV['PRIVATE_PRODUCTS'] || '').split(','))

  def self.private_ids
    @private_ids ||= (PRIVATE.any? ? Product.where(slug: PRIVATE).pluck(:id) : [])
  end

  def self.meta_id
    @meta_id ||= Product.find_by(slug: 'meta').try(:id)
  end

  default_scope -> { where(deleted_at: nil) }

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
  scope :public_products,  -> { where.not(id: Product.private_ids).where(flagged_at: nil).advertisable.where.not(state: ['stealth', 'reviewing']) }
  scope :repos_gt,         ->(count) { where('array_length(repos,1) > ?', count) }
  scope :since,            ->(time) { where('created_at >= ?', time) }
  scope :tagged_with_any,  ->(tags) { where('tags && ARRAY[?]::varchar[]', tags) }
  scope :validating,       -> { where(greenlit_at: nil) }
  scope :waiting_approval, -> { where('submitted_at is not null and evaluated_at is null') }
  scope :with_repo,        ->(repo) { where('? = ANY(repos)', repo) }
  scope :with_logo,        ->{ where.not(poster: nil).where.not(poster: '') }
  scope :stealth,      -> { where(state: 'stealth') }
  scope :team_building, -> { public_products.where(state: 'team_building') }
  scope :greenlit,     -> { public_products.where(state: 'greenlit') }
  scope :profitable,   -> { public_products.where(state: 'profitable') }
  scope :live,         -> { where.not(try_url: [nil, '']) }
  scope :with_mark,   -> (name) { joins(:marks).where(marks: { name: name }) }
  scope :with_topic,   -> (topic) { where('topics @> ARRAY[?]::varchar[]', topic) }
  scope :untagged, -> { where('array_length(tags, 1) IS NULL') }

  EXCLUSIONS = %w(admin about script if owner core start-conversation product ideas)

  validates :slug, uniqueness: { allow_nil: true },
                   exclusion: { in: EXCLUSIONS }
  validates :name, presence: true,
                   length: { minimum: 2, maximum: 255 },
                   exclusion: { in: EXCLUSIONS }
  validates :pitch, presence: true,
                    length: { maximum: 255 }

  before_create :generate_authentication_token
  before_validation :generate_asmlytics_key, on: :create

  after_commit -> { add_to_event_stream }, on: :create
  after_commit -> { Indexer.perform_async(:index, Product.to_s, self.id) }, on: :create

  after_update :update_elasticsearch

  serialize :repos, Repo::Github

  INITIAL_COINS = 6000
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

      event :reject,
        transitions_to: :stealth
    end

    state :greenlit do
      event :launch,
        transitions_to: :profitable

      event :remove,
        transitions_to: :stealth
    end

    state :profitable do
      event :remove, transitions_to: :stealth end
  end

  def self.unique_tags
    pluck('distinct unnest(tags)').sort_by{|t| t.downcase }
  end

  def self.active_product_count
    joins(:activities).where('activities.created_at > ?', 30.days.ago).group('products.id').having('count(*) > 5').count.count
  end

  def news_feed_items_with_mark(mark_name)
    QueryMarks.new.news_feed_items_per_product_per_mark(self, mark_name)
  end

  def sum_viewings
    Viewing.where(viewable: self).count
  end

  def wip_marks
    wips_won = self.wips

    results = {}
    wips_won.each do |w|
      marks = w.marks
      marks.each do |m|
        mark_name = m.name
        if results.has_key?(mark_name)
          results[mark_name] = results[mark_name] + 1
        else
          results[mark_name] = 1
        end
      end
    end
    results = Hash[results.sort_by{|k, v| v}.reverse]
  end

  def mark_fractions
    marks = self.wip_marks
    answer = {}
    sum_marks = marks.values.sum.to_f

    if sum_marks == 0
      sum_marks = 1
    end

    marks.each do |k, v|
      answer[k] = (v.to_f / sum_marks).round(3)
    end
    return answer
  end

  def most_active_contributor_ids(limit=6)
    activities.group('actor_id').order('count_id desc').limit(limit).count('id').keys
  end

  def most_active_contributors(limit=6)
    User.where(id: most_active_contributor_ids(limit))
  end


  def on_stealth_entry(prev_state, event, *args)
    update!(
      started_team_building_at: nil,
      greenlit_at: nil,
      profitable_at: nil
    )

  end

  def on_team_building_entry(prev_state, event, *args)
    update!(
      started_team_building_at: Time.now,
      greenlit_at: nil,
      profitable_at: nil
    )
  end

  def on_greenlit_entry(prev_state, event, *args)
    update!(
      greenlit_at: Time.now,
      profitable_at: nil
    )
    AssemblyCoin::GreenlightProduct.new.perform(self.id)
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

  def launched?
    current_state >= :team_building
  end

  def stopped_team_building_at
    started_team_building_at + 30.days
  end

  def team_building_days_left
    [(stopped_team_building_at.to_date - Date.today).to_i, 1].max
  end

  def team_building_percentage
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
    team_memberships.core_team.active.find_by(user_id: user.id).present?
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
    ::Event.joins(:wip).where('wips.product_id = ?', self.id).group('events.user_id').count.keys
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

  def visible_watchers
    system_user_ids = User.where(username: 'kernel').pluck(:id)
    watchers.where.not(id: system_user_ids)
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

  def poster_image
    self.logo || PosterImage.new(self)
  end

  def logo_url
    if logo
      logo.url
    elsif poster
      poster_image.url
    else
      DEFAULT_IMAGE_PATH
    end
  end

  def generate_authentication_token
    loop do
      self.authentication_token = Devise.friendly_token
      break authentication_token unless Product.find_by(authentication_token: authentication_token)
    end
  end

  def generate_asmlytics_key
    self.asmlytics_key = Digest::SHA1.hexdigest(ENV['ASMLYTICS_SECRET'].to_s + SecureRandom.uuid)
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

  def coins_minted
    transaction_log_entries.with_cents.sum(:cents)
  end

  def profit_last_month
    last_report = profit_reports.order('end_at DESC').first
    (last_report && last_report.profit) || 0
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

  def tags_string
    tags.join(', ')
  end

  def tags_string=(new_tags_string)
    self.tags = new_tags_string.split(',').map(&:strip)
  end

  def topic=(new_topic)
    self.topics = [new_topic]
  end

  def showcase=(showcase_slug)
    Showcase.find_by!(slug: showcase_slug).add!(self)
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

  def url_params
    self
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

    indexes :marks do
      indexes :name
      indexes :weight, type: 'float'
    end

    indexes :suggest, type: 'completion', payloads: true, index_analyzer: 'simple', search_analyzer: 'simple'
  end

  def as_indexed_json(options={})
    as_json(
      root: false,
      only: [:slug, :name, :pitch, :poster],
      methods: [:tech, :hidden, :sanitized_description, :suggest, :trend_score]
    ).merge(marks: mark_weights, logo_url: full_logo_url, search_tags: tags)
  end

  def mark_weights
    markings.sort_by{|marking| -marking.weight }.
             take(5).
             map{|marking| { weight: marking.weight, name: marking.mark.name } }
  end

  def trend_score
    product_trend.try(:score).to_i
  end

  def suggest
    {
      input: [name, pitch] + name.split(' ') + pitch.split(' '),
      output: id,
      weight: trend_score,
      payload: {
        id: id,
        slug: slug,
        name: name,
        pitch: pitch,
        logo_url: full_logo_url,
      }
    }
  end

  def full_logo_url
    # this is a hack to get a full url into elasticsearch, so firesize can resize it correctly.
    # DEFAULT_IMAGE_PATH is a relative image path
    logo_url == DEFAULT_IMAGE_PATH ? File.join(Rails.application.routes.url_helpers.root_url, DEFAULT_IMAGE_PATH) : logo_url
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

  def retrieve_key_pair
    AssemblyCoin::AssignBitcoinKeyPairWorker.perform_async(
      self.to_global_id,
      :assign_key_pair
    )
  end

  def assign_key_pair(key_pair)
    update!(
      wallet_public_address: key_pair["public_address"],
      wallet_private_key: key_pair["private_key"]
    )
  end

  def unvested_coins
    [10_000_000, transaction_log_entries.sum(:cents)].max
  end

  def mark_vector
    my_mark_vector = QueryMarks.new.mark_vector_for_object(self)
  end

  def normalized_mark_vector()
    QueryMarks.new.normalize_mark_vector(self.mark_vector())
  end

  def majority_owner
    total_coins = TransactionLogEntry.where(product: self).sum(:cents)
    majority_owner = TransactionLogEntry.where(product: self).group('wallet_id').sum(:cents).sort_by{|k,v| -v}.first

    majority_owner[1].to_f / total_coins.to_f >= 0.5
  end

  def proposals_sorted
    prod_proposals = Proposal.where(product: self).where.not(state: "hidden")
    open_proposals = prod_proposals.where(state: "open").sort_by{|a| a.expiration}.reverse
    passed_proposals = prod_proposals.where(state: "passed").sort_by{|a| a.expiration}.reverse
    failed_proposals = prod_proposals.where(state: "failed").sort_by{|a| a.expiration}.reverse
    expired_proposals = prod_proposals.where(state: "expired").sort_by{|a| a.expiration}.reverse
    open_proposals + passed_proposals + failed_proposals + expired_proposals
  end

  def active_contracts
    passed_proposals = self.proposals.where(state: ["passed", "expired"])
    contracts = []
    passed_proposals.each do |p|
      p.contracts.each do |c|
        if !c.expired?
          contracts.append(c)
        end
      end
    end
    contracts
  end

  def expired_contracts
    passed_proposals = self.proposals.where(state: ["passed", "expired"])
    contracts = []
    passed_proposals.each do |p|
      p.contracts.each do |c|
        if c.expired?
          contracts.append(c)
        end
      end
    end
    contracts
  end

  def try_url=(new_try_url)
    super(new_try_url.presence)
  end

  protected

  def add_to_event_stream
    StreamEvent.add_create_event!(actor: user, subject: self)
  end
end
