# I'm thinking about this class more as a discussion. Which may also hold a bounty

require 'activerecord/uuid'
require 'elasticsearch/model'

class Wip < ActiveRecord::Base
  include ActiveRecord::UUID
  include Elasticsearch::Model
  include Kaminari::ActiveRecordModelExtension
  include Workflow

  belongs_to :closer, class_name: 'User'
  belongs_to :flagged_by, class_name: 'User'
  belongs_to :product, :touch => (update_parent_product_for_caching = true)
  belongs_to :user

  has_many :comments, class_name: 'Event::Comment'
  has_many :events
  has_many :offers, inverse_of: :bounty
  has_many :milestones, through: :milestone_tasks
  has_many :milestone_tasks, foreign_key: 'task_id'
  has_many :mutings
  has_many :muters, through: :mutings, source: :user
  has_many :postings, class_name: 'BountyPosting', foreign_key: 'bounty_id'
  has_many :taggings, class_name: 'Wip::Tagging'
  has_many :tags, through: :taggings, class_name: 'Wip::Tag'
  has_many :awards

  has_one :milestone
  accepts_nested_attributes_for :milestone

  validates :title, presence: true, length: { minimum: 2 }

  before_validation :set_author_tip, on: :create
  after_commit :set_number, on: :create
  after_commit -> { Indexer.perform_async(:index, Wip.to_s, self.id) }, on: :create
  after_update :update_elasticsearch

  scope :available,   ->{ where(state: 'open') }
  scope :by_product,  ->(product){ where(product_id: product.id) }
  scope :closed,      -> { where('closed_at is not null') }
  scope :not_posted,  -> { joins('left outer join bounty_postings on bounty_postings.bounty_id = wips.id').where('bounty_postings.id is null') }
  scope :open,        -> { where('closed_at is null') }
  scope :opened_by,   ->(user) { where(user: user) }
  scope :promoted,    -> { where('promoted_at is not null') }
  scope :stale_by,    ->(age) { joins(:events).group('wips.id').having('max(events.created_at) < ?', age).order('max(events.created_at)') }
  scope :tagged_with, ->(name) { joins(:taggings => :tag).includes(:taggings => :tag).where('wip_tags.name = ?', name) }
  scope :tagged_with_any, ->(names) { joins(:taggings => :tag).includes(:taggings => :tag).where('wip_tags.name' => names) }
  scope :tagged_with_all, ->(names) { joins(:taggings => :tag).where('wip_tags.name' => names).group('wips.id').having('count(distinct wip_taggings.wip_tag_id) = ?', names.size) }
  scope :unflagged, -> { where(flagged_at: nil) }
  scope :ordered_by_activity, -> { joins(:events).group('wips.id').order('max(events.created_at)') }

  attr_accessor :readraptor_tag # set which tag you are viewing

  # Workflow
  workflow_column :state
  workflow do
    state :open do
      event :close,       :transitions_to => :resolved
    end
    state :resolved do
      event :reopen,      :transitions_to => :open
    end

    after_transition { notify_state_changed }
  end

  def open?
    closed_at.nil?
  end

  def closed?
    !open?
  end

  def awarded?
    self.awards.any?
  end

  def close(closer, reason=nil)
    add_activity closer, Activities::Close do
      add_event ::Event::Close.new(user: closer, body: reason) do
        set_closed(closer)
        milestones.each(&:touch)
      end
    end
  end

  def reopen(opener, reason)
    add_activity opener, Activities::Open do
      add_event ::Event::Reopen.new(user: opener, body: reason) do
        self.closer = nil
        self.closed_at = nil
        milestones.each(&:touch)
      end
    end
  end

  def update_title!(author, new_title)
    add_activity author, Activities::Update do
      add_event ::Event::TitleChange.new(user: author, body: self.title) do
        self.title = new_title
      end
    end
  end

  def sanitized_description
    text = (description || comments.order(:created_at).last.try(:body))
    Search::Sanitizer.new.sanitize(text) if text
  end

  def to_param
    number || id
  end

  def slug
    "#{product.slug}/#{number}"
  end

  # TODO finish the WIP split refactoring by removing these methods
  def promoted?
    false
  end

  def winner
    nil
  end

  def score
    nil
  end

  def score_multiplier
    nil
  end

  def awardable?
    false
  end

  def main_thread?
    false
  end

  # following

  def followers
    product.followers - muters
  end

  def follower_ids
    product.follower_ids - muter_ids
  end

  def followed_by?(user)
    product.followed_by?(user) && !muted_by?(user)
  end

  def muted_by?(user)
    !mutings.find_by(user: user, deleted_at: nil).nil?
  end

  def mute!(user)
    Muting.mute!(user, self)
  end

  def watch!(user)
    product.watch!(user)
    Muting.unmute!(user, self)
  end

  def contributors
    # TODO (whatupdave): when we can unwatch a wip we will need to look at this
    User.joins(:watchings)
      .where('watchings.watchable_id = ?', self.id)
      .where('watchings.unwatched_at is null')
  end

  # tagging

  def update_tag_names!(author, new_tag_names)
    return if self.tag_names.sort == new_tag_names.uniq.sort

    add_event ::Event::TagChange.new(user: author, from: self.tag_names.sort.join(','), to: new_tag_names.sort.join(',')) do
      self.tag_names = new_tag_names
    end
  end

  def add_tag!(tag_name)
    self.tag_names = ((tag_names || []) | [tag_name])
    save!
  end

  def tag_names
    tags.map(&:name)
  end

  def tag_names=(names)
    if names[0].class == Array
      names = names[0]
    end

    self.tags = names.map do |n|
      Wip::Tag.find_or_create_by!(name: n.strip)
    end
  end

  def tag_list
    tag_names.join(', ')
  end

  def tag_list=(names)
    self.tag_names = names.split(',')
  end

  # flagging

  def flag!(flagger)
    update! flagged_at: Time.now, flagged_by_id: flagger.id
  end

  def unflag!
    update! flagged_at: nil, flagged_by_id: nil
  end

  def flagged?
    !flagged_at.nil?
  end

  def featured?
    flagged_at.nil?
  end

  # callbacks

  def push_channel
    [product.slug, number].join('.')
  end

  def event_added(event)
    Wip.reset_counters(self.id, :events)
    Wip.reset_counters(self.id, :comments)
  end

  def vote_added(vote)
    product.watch!(vote.user)
    watch!(vote.user)
  end

  def notify_by_email(user)
    EmailLog.send_once(user.id, id) do
      WipMailer.delay(queue: 'mailer').wip_created(user.id, id) unless user.mail_never?
    end
  end

  def notify_state_changed
    PusherWorker.perform_async push_channel, 'changed', WipSerializer.new(self).to_json
  end

  # elasticsearch
  def update_elasticsearch
    return unless title_changed? || state_changed?

    Indexer.perform_async(:index, Wip.to_s, self.id)
  end

  settings(
    analysis: {
      analyzer: {
        ngram_analyzer: {
          tokenizer: 'ngram_tokenizer'
        }
      },
      tokenizer: {
        ngram_tokenizer: {
          type: 'nGram',
          min_gram: 3,
          max_gram: 25,
          token_chars: ['letter', 'digit']
        }
      }
    }
  ) do
    mappings dynamic: false do
      indexes :title,  index: 'ngram_analyzer'
      indexes :hidden, index: 'not_analyzed'
      indexes :state,  index: 'not_analyzed'

      indexes :comments do
        indexes :sanitized_body, analyzer: 'snowball'
      end

      indexes :product do
        indexes :slug, index: 'not_analyzed'
      end
    end
  end


  def as_indexed_json(options={})
    as_json(
      only: [:title, :number, :state],
      methods: [:hidden],

      include: {
        comments: {only: [:id, :number], methods: [:sanitized_body]},
        product: {only: [:slug] }
      }
    )
  end

  def hidden
    product.try(:hidden)
  end

  # protected

  def set_author_tip
    self.author_tip = Task::AUTHOR_TIP
  end

  def set_number
    return unless number.nil?

    Room.create_for!(product, self).tap do |shortcut|
      self.update_column :number, shortcut.number
    end
  end

  def add_activity(actor, klass, &block)
    block.call.tap do |event|
      klass.publish!(
        actor: actor,
        subject: event,
        target: self
      )
    end
  end

  def add_event(event, &block)
    with_lock do
      events << event
      block.call(event) if block
      save!
    end
    event
  end

  def set_closed(closer)
    raise ActiveRecord::RecordNotSaved if closed?

    self.closer = closer
    self.closed_at = Time.current

    milestones.each(&:touch)
  end

  def track_activity
    StreamEvent.add_create_event!(actor: user, subject: self, target: product)
  end

  def to_partial_path
    # Special case for Projects
    if self.class == Wip
      'projects/project'
    elsif self.class == Task
      'bounties/bounty'
    else
      super
    end
  end

end
