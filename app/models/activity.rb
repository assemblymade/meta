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
  after_commit :notify_staff, on: :create

  attr_accessor :socket_id

  def self.publish!(opts)
    create!(opts).tap do |a|
      if a.publishable
        PublishActivity.perform_async(a.id) if Story.should_publish?(a)
        room = if a.target.is_a?(ChatRoom)
          a.target
        elsif product = (opts[:product] || a.find_product)
          product.update!(last_activity_at: a.created_at)
          product.chat_rooms.first
        end

        if room
          a.publish_to_chat(room.id)

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

  def track_in_segment
    return if actor.try(:staff?)

    TrackActivityCreated.perform_async(self.id)
  end

  def notify_staff
    case verb
    when "Comment"
      SlackNotifier.first_story(
        actor,
        self
        ) unless actor.activities.where(type: "Activities::Comment").count > 1
    when "Post"
      SlackNotifier.first_story(
        actor,
        self
        ) unless actor.activities.where(type: "Activities::Post").count > 1
    when "Chat"
      SlackNotifier.first_chat_message(
        actor,
        target.slug
        ) unless actor.activities.where(type: "Activities::Chat").count > 1
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
end
