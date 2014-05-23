require 'activerecord/uuid'

class Wip < ActiveRecord::Base
  include ActiveRecord::UUID
  include Tire::Model::Search
  include Tire::Model::Callbacks
  include Kaminari::ActiveRecordModelExtension
  include Workflow

  belongs_to :product, :touch => (update_parent_product_for_caching = true)
  belongs_to :user
  belongs_to :closer, class_name: 'User'

  has_many :activities, as: :subject
  has_many :comments, class_name: 'Event::Comment'
  has_many :events
  has_many :milestones, through: :milestone_tasks
  has_many :milestone_tasks, foreign_key: 'task_id'
  has_many :taggings, class_name: 'Wip::Tagging'
  has_many :tags, through: :taggings, class_name: 'Wip::Tag'
  has_many :watchings, :as => :watchable
  has_many :watchers, :through => :watchings, :source => :user

  has_one :milestone
  accepts_nested_attributes_for :milestone

  validates :title, presence: true, length: { minimum: 2 }

  after_commit :set_number, on: :create
  after_create :add_watcher!

  scope :available,   ->{ where(state: 'open') }
  scope :by_product,  ->(product){ where(product_id: product.id) }
  scope :closed,      -> { where('closed_at is not null') }
  scope :open,        -> { where('closed_at is null') }
  scope :opened_by,   ->(user) { where(user: user) }
  scope :promoted,    -> { where('promoted_at is not null') }
  scope :stale_by,    ->(age) { joins(:events).group('wips.id').having('max(events.created_at) < ?', age).order('max(events.created_at)') }
  scope :tagged_with, ->(name) { joins(:taggings => :tag).includes(:taggings => :tag).where('wip_tags.name = ?', name) }
  scope :tagged_with_any, ->(names) { joins(:taggings => :tag).includes(:taggings => :tag).where('wip_tags.name' => names) }
  scope :tagged_with_all, ->(names) { joins(:taggings => :tag).where('wip_tags.name' => names).group('wips.id').having('count(distinct wip_taggings.wip_tag_id) = ?', names.size) }

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
    !!self.winner
  end

  def close(closer, reason)
    add_event ::Event::Close.new(user: closer, body: reason) do
      set_closed(closer)
    end
  end

  def reopen(opener, reason)
    add_event ::Event::Reopen.new(user: opener, body: reason) do
      self.closer = nil
      self.closed_at = nil
      self.winning_event = nil
    end
    milestones.each(&:touch)
  end

  def update_title!(author, new_title)
    add_event ::Event::TitleChange.new(user: author, body: self.title) do
      self.title = new_title
    end
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

  def upvotable?
    false
  end

  def downvotable?
    false
  end

  def upvote!(user, ip)
    # overridden
  end

  def winning_event=(something)
    # ignore
  end

  def closeable?
    true
  end

  def awardable?
    false
  end

  def main_thread?
    false
  end

  def move_to!(type, mover)
    # don't allow moving closed WIPs
    raise ActiveRecord::RecordNotSaved unless mover.can? :move, self
    add_event ::Event::TypeChange.new(user: mover, from: self.type, to: type) do
      self.type = type.to_s
    end
  end

  # watching

  def add_watcher!
    watch!(self.user)
  end

  def watch!(user)
    Watching.watch!(user, self)
  end

  def contributors
    # TODO (whatupdave): when we can unwatch a wip we will need to look at this
    watchers
  end

  # tagging

  def update_tag_names!(author, new_tag_names)
    return if self.tag_names.sort == new_tag_names.uniq.sort

    add_event ::Event::TagChange.new(user: author, from: self.tag_names.sort.join(','), to: new_tag_names.sort.join(',')) do
      self.tag_names = new_tag_names
    end
  end

  def tag_names
    tags.map(&:name)
  end

  def tag_names=(names)
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

  # callbacks

  def push_channel
    [product.slug, number].join('.')
  end

  def event_added(event)
    Wip.reset_counters(self.id, :events)
    Wip.reset_counters(self.id, :comments)

    event.wip.watch!(event.user)
    watch!(event.user)

    PusherWorker.perform_async push_channel, 'event.added',
      EventSerializer.for(event, nil).as_json.merge(socket_id: event.socket_id).to_json
  end

  def vote_added(vote)
    product.watch!(vote.user)
    watch!(vote.user)
  end

  def notify_user!(user)
    WipMailer.delay.wip_created(user.id, id) unless user.mail_never?
  end

  def notify_state_changed
    PusherWorker.perform_async push_channel, 'changed', WipSerializer.new(self).to_json
  end

  # updates

  def updates
    Wip::Updates.new(self)
  end

  # elasticsearch

  tire.mapping do
    indexes :id,      :index    => :not_analyzed
    indexes :title,   :boost => 10, :analyzer => 'snowball'
    indexes :number,  :index => :not_analyzed, type: 'integer'
    indexes :product, :index => :not_analyzed
    indexes :comments do
      indexes :body
    end
  end

  def to_indexed_json
    {
      title: title,
      number: number,
      product: product.to_param,
      url: Rails.application.routes.url_helpers.product_wip_path(product, self),  # ugh.
      comments: comments.map { |c| { body: c.body } }
    }.to_json if number
  end

  # protected

  def set_number
    return unless number.nil?

    ProductShortcut.create_for!(product, self).tap do |shortcut|
      self.update_column :number, shortcut.number
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
end
