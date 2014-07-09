# TODO: (whatupdave) deprecate this class in favor of Activity
class StreamEvent < ActiveRecord::Base
  include Rails.application.routes.url_helpers
  include Kaminari::ActiveRecordModelExtension
  include ERB::Util

  belongs_to :actor,    class_name:  User.name
  belongs_to :subject,  polymorphic: true
  belongs_to :target,   polymorphic: true
  belongs_to :product,  touch: true

  default_scope   -> { order(created_at: :desc) }
  scope :since,   -> (date) { where('stream_events.created_at >= ?', date) }
  scope :visible, -> { where(product_flagged: false).joins(:product).where('products.launched_at is not null') }
  before_create :find_and_set_product_id, :set_event_type
  after_commit :notify, on: :create

  class << self
    def add_create_event!(params)
      create!(params.merge(verb: 'create'))
    end

    def add_closed_event!(params)
      create!(params.merge(verb: 'close'))
    end

    def add_win_event!(params)
      create!(params.merge(verb: 'win'))
    end

    def add_signup_event!(params)
      create!(params.merge(verb: 'signup'))
    end

    def add_mission_completed_event!(params)
      create!(params.merge(verb: 'complete'))
    end

    def add_promoted_event!(params)
      create!(params.merge(verb: 'promote'))
    end

    def add_demoted_event!(params)
      create!(params.merge(verb: 'demote'))
    end

    def add_allocated_event!(params)
      create!(params.merge(verb: 'allocate'))
    end

    def add_unallocated_event!(params)
      create!(params.merge(verb: 'unallocate'))
    end

    def add_reviewable_event!(params)
      create!(params.merge(verb: 'reviewable'))
    end

    def add_work_event!(params)
      create!(params.merge(verb: 'work'))
    end
  end

  def product_name
    product.name
  end

  def timestamp
    {
      1.hour.ago..1.minute.from_now => 'just now',
      3.hours.ago..1.hour.ago       => 'an hour ago',
      1.day.ago..3.hours.ago        => 'a few hours ago',
      2.days.ago..1.day.ago         => 'a day ago',
      1.week.ago..2.days.ago        => 'this week',
    }.detect { |range, _| range.cover?(created_at) }.try(:last) ||
    'more than a week'
  end

  def expandable?
    false
  end

  def votable?
    false
  end

  def work?
    false
  end

  def highlight?
    false
  end

  def important?
    false
  end

  def to_partial_path
    'stream_events/stream_event'
  end

  def css_classes
    [ expandable? && 'activity-group-expandable',
      votable?    && 'activity-group-votable',
      highlight?  && 'activity-group-highlight',
      important?  && 'activity-group-important' ].select{ |c| c }.join(' ')
  end

  def icon_class
    ""
  end

  def notify
    CampfireNotifier.delay.send_activity(self.id)
  end

  def chat_message(raw_text)
    "[#{product.slug}] @#{actor.username} #{raw_text}"
  end

  def cache_key
    key = super
    key = [key, work].join('/') if work?
    key
  end

  protected
  def find_and_set_product_id
    self.product_id = subject.product_id if subject.respond_to?(:product_id)
    self.product_id = target.product_id  if self.product_id.nil? && target.respond_to?(:product_id)
    self.product_id = subject.id         if self.product_id.nil? && subject.class == Product
    self.product_id = target.id          if self.product_id.nil? && target.class == Product
    self.product_flagged = product.flagged?

    true
  end

  def set_event_type
    self.type = "StreamEvents::#{verb.titleize}#{subject.class.name.demodulize}"
  end
end
