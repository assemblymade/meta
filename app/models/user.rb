require 'activerecord/uuid'
require 'avatar'
require 'stripe'

class User < ActiveRecord::Base
  include ActiveRecord::UUID

  has_many :core_products, :through => :core_team_memberships, :source => :product
  has_many :core_team_memberships
  has_many :products
  has_many :product_logos
  has_many :preorders
  has_many :watchings
  has_many :followed_tags, :through => :watchings, :source => :watchable, :source_type => 'Wip::Tag'
  has_many :saved_searches
  has_many :team_memberships
  has_many :wips
  has_many :wip_workers, :class_name => 'Wip::Worker'
  has_many :wips_working_on, ->{ where(state: Task::IN_PROGRESS) }, :through => :wip_workers, :source => :wip
  has_many :votes
  has_many :events
  has_many :wips_contributed_to, -> { where(events: { type: Event::MAILABLE }).uniq.order("created_at DESC") }, :through => :events, :source => :wip
  has_many :activities,    foreign_key: 'owner_id'
  has_many :stream_events, foreign_key: 'actor_id'
  has_many :watched_products, :through => :watchings, :source => :watchable, :source_type => Product

  devise :confirmable,
         :database_authenticatable,
         :omniauthable,
         :recoverable,
         :registerable,
         :rememberable,
         :token_authenticatable,
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

  scope :mailable, -> { where.not(mail_preference: MAIL_NEVER) }
  scope :staff, -> { where(is_staff: true) }
  scope :wip_creators, -> { joins(:wips) }
  scope :event_creators, -> { joins(:events) }
  scope :awaiting_personal_email, -> { where(personal_email_sent_on: nil).where("created_at > ? AND last_request_at < ?", 14.days.ago, 3.days.ago) }

  class << self
    def find_first_by_auth_conditions(warden_conditions)
      conditions = warden_conditions.dup
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

    %w(asm-bot maeby).each do |username|
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

  def preordered_perk?(perk)
    preorders.where(perk_id: perk.id).exists?
  end

  def staff?
    is_staff?
  end

  def paid_via_paypal?
    payment_option == PaymentOption::PAYPAL && !paypal_email.nil?
  end

  def paid_via_ach?
    payment_option == PaymentOption::ACH && bank_account_id && bank_name && bank_last4 && address_line1 && address_city && address_zip
  end

  def missing_payment_information?
    !(paid_via_ach? || paid_via_paypal?)
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

  def recent_products
    if recent_product_ids && recent_product_ids.any?
      Product.find(recent_product_ids).sort_by{|p| recent_product_ids.index(p.id) }
    end
  end

  def has_voted_for?(product)
    product.voted_by?(self)
  end

  # this is used on signup to auto follow a product
  def follow_product=(slug)
    Watching.watch!(self, Product.find_by!(slug: slug)) unless slug.blank?
  end

  def sum_month_points(time)
    Task.won_by(self).inject(0) {|sum, wip| sum + wip.score }
  end

  def to_param
    username
  end

  def voted_for?(votable)
    votable.votes.where(user: self).any?
  end

  attr_reader :stripe_customer

  def ensure_stripe_customer!(token)
    ensurer = StripeCustomerEnsurer.new(self, token)
    ensurer.ensure!
    @stripe_customer = ensurer.customer
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

  def mail_immediate?
    mail_preference == 'immediate'
  end

  def mail_daily?
    mail_preference == 'daily'
  end

  def mail_never?
    mail_preference == 'never'
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

end
