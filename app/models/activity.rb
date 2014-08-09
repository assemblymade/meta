class Activity < ActiveRecord::Base
  belongs_to :actor,   polymorphic: true
  belongs_to :subject, polymorphic: true
  belongs_to :target,  polymorphic: true

  belongs_to :story

  has_many :tips, foreign_key: 'via_id'

  validates :actor,   presence: true
  validates :subject, presence: true
  validates :target,  presence: true

  after_commit :track_in_segment, on: :create

  attr_accessor :socket_id

  def self.publish!(opts)
    create!(opts).tap do |a|
      if product = a.target.try(:product)
        auto_subscribe!(a.actor, a.target.product)
      end

      PublishActivity.perform_async(a.id) if Story.should_publish?(a)
      a.publish_to_chat
    end
  end

  def self.auto_subscribe!(actor, target)
    Watching.auto_subscribe!(actor, target)
  end

  def track_in_segment
    return if actor.staff?

    TrackActivityCreated.perform_async(self.id)
  end

  # make this object tippable
  def tip_receiver
    actor
  end

  def verb
    self.class.name.split('::').last
  end

  def verb_subject
    s = subject_type == 'Event' ? target : subject
    raise "Bad Subject #{self.inspect}" if s.nil?

    s.class.name.split('::').last
  end

  # deprecated
  def streams
    stream_targets.map do |o|
      ActivityStream.new(o)
    end
  end

  def stream_targets
    [actor, target]
  end

  def publish_to_chat
    streams.each do |stream|
      stream.push(self)
    end
  end
end
