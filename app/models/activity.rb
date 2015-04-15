class Activity < ActiveRecord::Base
  belongs_to :product

  belongs_to :actor,   polymorphic: true
  belongs_to :subject, polymorphic: true
  belongs_to :target,  polymorphic: true

  belongs_to :story

  has_many :tips, foreign_key: 'via_id'

  validates :actor,   presence: true
  validates :subject, presence: true
  validates :target,  presence: true

  before_validation :set_product_id, on: :create

  after_commit :track_in_segment, on: :create
  after_commit :notify_staff, on: :create

  attr_accessor :socket_id

  delegate :url_params, to: :target_entity

  def self.publish!(opts)
    bridge = opts.delete(:bridge)
    create!(opts).tap do |a|
      if a.publishable
        if Story.should_publish?(a)
          PublishActivity.perform_async(a.id, a.socket_id)
        end
        room = if a.target.is_a?(ChatRoom)
          a.target
        elsif product = (opts[:product] || a.find_product)
          product.update!(last_activity_at: a.created_at)
          product.chat_rooms.first
        end

        if room
          a.publish_to_chat(room.id)

          if a.subject.try(:body) && !bridge
            a.push_to_landline(room, a.subject.body, a.actor)
          end
          # only touch updated_at for chat messages.
          # We don't want the room to be marked as unread for events
          # other than people chatting
          room.touch if a.is_a? Activities::Chat
        end

      end
    end
  end

  def target_entity
    (subject_type == 'Event' || subject_type == 'NewsFeedItemComment') ? target : subject
  end

  def track_analytics?
    !actor.try(:staff?)
  end

  def track_in_segment
    return if !track_analytics?

    TrackActivityCreated.perform_async(self.id)
  end

  def notify_staff
    case verb
    when "Comment"
      unless actor.activities.where(type: "Activities::Comment").count > 1
        SlackNotifier.first_activity(self)
      end
    when "Post"
      unless actor.activities.where(type: "Activities::Post").count > 1
        SlackNotifier.first_activity(self)
      end
    when "Chat"
      unless actor.activities.where(type: "Activities::Chat").count > 1
        SlackNotifier.first_activity(self)
      end
    when "Introduce"
      unless actor.activities.where(type: "Activities::Introduce").count > 1
        SlackNotifier.first_activity(self)
        GrowthHack.staff_auto_love(self)
      end
    end
  end

  # make this object tippable
  def tip_receiver
    actor
  end

  def verb
    self.class.name.split('::').last
  end

  def verb_subject
    s = target_entity
    raise "Bad Subject #{self.inspect}" if s.nil?

    s.class.name.split('::').last.gsub(/Decorator$/,'')
  end

  def find_product
    subject.try(:product) || target.try(:product)
  end

  def publish_to_chat(room_id)
    ActivityStream.new(room_id).push(self)
  end

  def push_to_landline(room, body, actor)
    LandlineBridgeWorker.perform_async(
      room.slug,
      body,
      actor.id
    )
  end

  def publishable
    false
  end

  # for hearts
  def author_id
    actor_id
  end

  def product
    find_product
  end

  def engagement?
    false
  end

  # private
  def set_product_id
    self.product_id ||= (try(:subject).try(:product_id) || try(:subject).try(:product).try(:id))
  end
end
