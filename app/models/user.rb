require 'activerecord/uuid'
require 'avatar'
require 'stripe'

class User < ActiveRecord::Base
  include ActiveRecord::UUID
  include Elasticsearch::Model
  include GlobalID::Identification

  LEADER_TIME_SPAN = 7.days

  attr_encryptor :wallet_private_key,
    :key => ENV["USER_ENCRYPTION_KEY"],
    :encode => true,
    :mode => :per_attribute_iv_and_salt,
    :unless => Rails.env.test?

  belongs_to :user_cluster
  has_many :leader_positions

  has_many :activities,    foreign_key: 'actor_id'
  has_many :core_products, through: :core_team_memberships, source: :product
  has_many :core_team_memberships, -> { where(is_core: true) }, class_name: 'TeamMembership'

  has_many :assembly_assets
  has_many :awards, foreign_key: 'winner_id'
  has_many :choices
  has_many :deeds
  has_many :events
  has_many :hearts
  has_many :products
  has_many :product_logos
  has_many :proposals
  has_many :followed_products, through: :watchings, source: :watchable, source_type: Product
  has_many :followed_tags, through: :watchings, source: :watchable, source_type: Wip::Tag
  has_many :locked_wips, class_name: 'Wip', foreign_key: 'locked_by'
  has_many :wips
  has_many :wip_workers, :class_name => 'Wip::Worker'
  has_many :wips_working_on, ->{ where(state: Task::IN_PROGRESS) }, :through => :wip_workers, :source => :wip
  has_many :wips_watched, :through => :watchings, :source => :watchable, :source_type => Wip
  has_many :votes
  has_many :wips_awarded_to, through: :awards, source: :wip
  has_many :wips_commented_on, -> { where(events: { type: Event::Comment }).group('wips.id').order('MAX(events.created_at) DESC') }, :through => :events, :source => :wip
  has_many :screenshots, through: :assets
  has_many :stream_events, foreign_key: 'actor_id'
  has_many :saved_searches
  has_one  :tax_info
  has_many :team_memberships
  has_many :transaction_log_entries, foreign_key: 'wallet_id'
  has_many :viewings
  has_many :watchings
  has_many :withdrawals
  has_many :ideas
  has_many :top_bountys
  has_many :top_products
  has_many :markings, as: :markable
  has_many :marks, through: :markings

  has_one :payment_option
  has_one :chronicle
  has_one :requester, :class_name => "User", :foreign_key => "requester_id"
  has_one :user_identity

  devise :confirmable,
         :database_authenticatable,
         :omniauthable,
         :recoverable,
         :registerable,
         :rememberable,
         :trackable,
         :validatable,
         :omniauth_providers => [:facebook, :github, :twitter],
         :authentication_keys => [:login]

  attr_accessor :login

  # auto confirm email. If we get a bounce we'll make them confirm, for now
  # we'll assume the email is correct
  before_create :skip_confirmation!

  # Everybody gets an authentication token for quick access from emails

  before_save :ensure_authentication_token

  after_commit -> { Indexer.perform_async(:index, User.to_s, self.id) }, on: :create
  after_commit :retrieve_key_pair, on: :create
  after_commit :create_identity, on: :create

  # default users to immediate email
  MAIL_DAILY = 'daily'
  MAIL_HOURLY = 'hourly'
  MAIL_IMMEDIATE = 'immediate'
  MAIL_NEVER = 'never'

  USERNAME_REGEX = /\A@?([\w+-]+)\z/

  before_validation -> { self.mail_preference = MAIL_DAILY }, on: :create
  validates :mail_preference, inclusion: { in: [MAIL_DAILY, MAIL_HOURLY, MAIL_IMMEDIATE, MAIL_NEVER] }

  after_save :username_renamed, :if => :username_changed?

  validates :username,
    presence: true,
    uniqueness: { case_sensitive: false },
    length: { minimum: 2 },
    format: { with: /\A[a-zA-Z0-9-]+\z/ }

  default_scope -> { where('users.deleted_at is null') }

  scope :awaiting_personal_email, -> { where(personal_email_sent_on: nil).where("created_at > ? AND last_request_at < ?", 14.days.ago, 3.days.ago) }
  scope :bitcoiners, -> { joins(:payment_option).where(user_payment_options: {type: "User::BitcoinPaymentOption"})  }
  scope :event_creators, -> { joins(:events) }
  scope :mailable, -> { where.not(mail_preference: MAIL_NEVER) }
  scope :owed_money, -> { joins(:withdrawals).where(user_withdrawals: {payment_sent_at: nil}) }
  scope :recently_inactive, -> { where("last_sign_in_at < ?", 7.days.ago).where("last_sign_in_at > ?", 30.days.ago) }
  scope :staff, -> { where(is_staff: true) }
  scope :with_avatars, -> { where.not(gravatar_verified_at: nil) }
  scope :wip_creators, -> { joins(:wips) }

  class << self
    def find_first_by_auth_conditions(tainted_conditions)
      conditions = tainted_conditions.dup
      conditions.try(:permit!)
      if login = conditions.delete(:login).try(:downcase)
        if login.uuid?
          where(conditions).where("id = ?", login).first
        else
          where(conditions).where("lower(email) = ? OR lower(username) = ?", login, login).first
        end
      else
        where(conditions).first
      end
    end

    def by_partial_match(query)
      where("lower(name) like :query", query: "%#{query.downcase}%")
    end

    %w(asm-bot maeby kernel).each do |username|
      define_method username.underscore.to_sym do
        find_by(username: username).tap do |user|
          raise "You need an #{username} user in your database. Run db:seeds" if user.nil?
        end
      end
    end

    def contributors
      union_query = Arel::Nodes::Union.new(wip_creators.arel, event_creators.arel)
      User.find_by_sql(union_query.to_sql)
    end
  end

  def has_github_account?
    !github_uid.blank?
  end

  def wips_won
    Task.won_by(self).order("created_at DESC")
  end

  def avatar
    Avatar.new(self)
  end

  def flag!
    update(flagged_at: Time.now)
  end

  def unflag!
    update(flagged_at: nil)
  end

  def karma_total
    Deed.where(user_id: self.id).sum(:karma_value)
  end

  def create_identity
    UserIdentity.create!({user_id: self.id})
  end

  def staff?
    is_staff?
  end

  def core_on
    self.core_team_memberships.map{ |a| Product.find(a.product_id) }
  end

  def sponsored?
    staff?
  end

  def beta_subscription
    !beta_subscriber_at.nil?
  end

  def beta_subscription=(subscribed)
    self.beta_subscriber_at = subscribed.to_i == 1 ? Time.now : nil
  end

  def is_beta_subscriber?
    beta_subscription
  end

  def last_contribution
    events.order("created_at ASC").last
  end

  def email_failed_at!(time)
    self.confirmed_at = nil
    self.confirmation_sent_at = nil
    self.email_failed_at = time
    self.save!
  end

  def email_failed?
    !!email_failed_at
  end

  def employment
    UserEmployment.new(JSON.parse(extra_data)['work']) unless extra_data.nil?
  end

  def confirmation_sent?
    !!confirmation_sent_at
  end

  def influence
    1
  end

  def password_required?
    super unless facebook_uid?
  end

  def product_cents
    product_id_cents = TransactionLogEntry.product_balances(self)
    products = Hash[Product.find(product_id_cents.keys).map{|p| [p.id, p] }]
    Hash[product_id_cents.map{|product_id, cents| [products[product_id], cents] }]
  end

  def pusher_channel
    "user.#{id}"
  end

  def recent_products
    if recent_product_ids && recent_product_ids.any?
      Product.find(recent_product_ids).sort_by{|p| recent_product_ids.index(p.id) }
    end
  end

  def has_voted_for?(product)
    product.voted_by?(self)
  end

  def most_interesting_product
      products.where(flagged_at: nil).
               where('lower(name) != ?', 'test').
               order(:watchings_count).last

  end

  def love_given
    Heart.where(user: self).count.to_f
  end

  def love_ratio
    if self.hearts_received > 0
       self.love_given / self.hearts_received
    else
      0
    end
  end

  def partnerships
    Product.
       joins(:transaction_log_entries).
       where(transaction_log_entries: { wallet_id: id }).
       group('products.id')
  end

  def involved_products
    Product.
      public_products.
      joins("left join hearts on hearts.product_id = products.id and hearts.target_user_id = '#{self.id}'").
      joins("left join transaction_log_entries t on t.product_id = products.id and t.wallet_id = '#{self.id}'").
      where("t.id is not null or hearts.id is not null").
      group('products.id')
  end

  # this is used on signup to auto follow a product
  def follow_product=(slug)
    Watching.watch!(self, Product.find_by!(slug: slug)) unless slug.blank?
  end

  def sum_assembly_assets
    assembly_assets.reduce(0) { |col, asset| asset.amount + col }
  end

  def to_param
    username
  end

  def voted_for?(votable)
    votable.votes.where(user: self).any?
  end

  def username_renamed
    # UsernameRenameWorker.perform_async self.id, username_was
  end

  def short_name
    if name.blank?
      username
    else
      name.split(/ |@/).first.strip
    end
  end

  def public_address_url
    "#{ENV['ASSEMBLY_COINS_URL']}/addresses/#{wallet_public_address}"
  end

  def mail_immediate?
    mail_preference == 'immediate'
  end

  def mail_daily?
    mail_preference == 'daily'
  end

  def mail_never?
    mail_preference == 'never'
  end

  def coinprism_url
    if self.wallet_public_address
      "https://www.coinprism.info/address/#{self.wallet_public_address}"
    end
  end

  # cancan

  def ability
    @ability ||= Ability.new(self)
  end

  delegate :can?, :cannot?, :to => :ability

  def email_address
    @email_address ||= Mail::Address.new.tap do |addr|
      addr.address = email
      addr.display_name = username
    end
  end

  #accounting

  def total_received
    ((self.withdrawals.where.not(payment_sent_at: nil).sum(:total_amount) - self.withdrawals.where.not(payment_sent_at: nil).sum(:amount_withheld))/100).round(2)
  end

  def total_earned
    (self.withdrawals.sum(:total_amount).to_f/100.to_f).round(2)
  end

  def total_owed
    (self.total_earned - self.total_received - self.total_withheld).round(2)
  end

  def total_withheld
    (self.withdrawals.where.not(payment_sent_at: nil).sum(:amount_withheld)/100).round(2)
  end

  def user_awards_score
    scores = {}
    Award.where(winner_id: self.id).each do |a|
      time_diff = (DateTime.now.to_i - a.created_at.to_i).to_f / LEADER_TIME_SPAN.to_f
      multiplier = 2.0**(-1.0 * time_diff.to_f)
      mv = a.wip.mark_vector.take(10)
      mv.each do |q|
        weight = q[1] * multiplier
        q[0] = Mark.find_by(id: q[0]).name
        if scores.has_key?(q[0])
          scores[q[0]] = scores[q[0]] + weight
        else
          scores[q[0]] = weight
        end
      end
    end
    m = scores.sum{|k, v| v}
    scores['Overall'] = m
    scores.sort_by{|k,v| -v}
  end

  # elasticsearch
  mappings do
    indexes :username
    indexes :suggest_username, type: 'completion', payloads: true
  end

  def as_indexed_json(options={})
    as_json(root: false, only: [:username], methods: [:suggest_username])
  end

  def suggest_username
    {
      input: username,
      weight: last_request_at.to_i,
      payload: {
        id: id,
        name: name,
        avatar_url: avatar.url.to_s,
      }
    }
  end

  def ensure_authentication_token
    if authentication_token.blank?
      self.authentication_token = generate_authentication_token
    end
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

  def sum_viewings
    self.viewings.count
  end

  def welcome_tweet
    Tweeter.new.tweet_welcome_user(self)
  end

  #governance

  def can_vote?(product)
    TransactionLogEntry.product_balances(self).include?(product.id)
  end

  def mark_names=(new_mark_names)
    new_marks = new_mark_names.map { |name| Mark.where(name: name.parameterize).first_or_create }
    self.marks = new_marks
    self.top_products = []
  end

  # news_feed_item

  def user
    self # this allows us to use user as the target of an NFI. This is the user signed up NFI
  end

  def url_params
    ["hello", self]
  end


  private

  def generate_authentication_token
    loop do
      token = Devise.friendly_token
      break token unless User.where(authentication_token: token).first
    end
  end



end
