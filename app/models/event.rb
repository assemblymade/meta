require 'activerecord/uuid'

# TODO: (whatupdave) rename this. These are wip events (comments, opens, awards etc)
class Event < ActiveRecord::Base
  include ActiveRecord::UUID
  include Versioning
  include ActionView::Helpers::TextHelper

  belongs_to :event
  belongs_to :user
  belongs_to :wip, touch: true, counter_cache: true

  has_many :activities, as: :subject
  has_many :tips, foreign_key: 'via_id'
  has_many :tippers, through: :tips, source: :from

  has_one :news_feed_item_comment, foreign_key: 'target_id'

  after_commit -> { self.wip.event_added(self); }, on: :create
  after_commit -> { Indexer.perform_async(:index, Wip.to_s, self.wip.id) }
  # after_commit -> { self.record_identity_change } # This is messing with the Redis worker queue

  delegate :product, :to => :wip

  acts_as_sequenced scope: :wip_id, column: :number, start_at: 1

  MAILABLE = [
    Event::Close,
    Event::Comment,
    Event::CommitReference,
    Event::Reopen,
    Event::Win
  ]

  attr_accessor :socket_id # for Pusher
  attr_accessor :readraptor_tag # set which tag you are viewing

  def record_identity_change
    if type == 'Event::Comment'
      interpreted_vector = Interpreter.new.mark_vector_from_text(body)
      MakeMarks.new.mark_with_vector_additively(user.user_identity, interpreted_vector, 0.1)
    end
  end

  def self.analytics_name
    "wip.#{slug}"
  end

  def awardable?
    false
  end

  def tippable?
    false
  end

  # make events tippable
  def tip_receiver
    user
  end

  def editable?
    false
  end

  def notify_by_email?
    MAILABLE.include?(self.class) && user.flagged_at.nil?
  end

  def auto_watch!(user)
    wip.auto_watch!(user)
  end

  def notify_by_email(user)
    if notify_by_email? && !user.mail_never?
      EmailLog.send_once user.id, self.id do
        case
        when wip.chat?
          ChatMailer.delay(queue: 'mailer').mentioned_in_chat(user.id, self.id)
        else
          WipMailer.delay(queue: 'mailer').wip_event_added(user.id, self.id)
        end
      end
    end
  end

  def mentioned_users
    users = []
    TextFilters::UserMentionFilter.mentioned_usernames_in(self.body, self.wip.product) do |username, u|
      if u
        users << u if u && u != user
      end
    end

    users.flatten.uniq
  end

  def mentioned_user_ids
    mentioned_users.map(&:id)
  end

  def to_param
    number
  end

  # stories
  def url_params
    [product, wip, anchor: self.number]
  end

  def self.slug
    name.demodulize.underscore.downcase
  end

  def self.render_events(events, current_user)
    # TODO (chrislloyd) This is a hack from the old Mustache days. It could be
    #      really cleaned up.
    events.map do |event|
      event_data = EventSerializer.for(event, current_user).as_json

      if current_user
        tracker = ReadraptorTracker.new(ReadRaptorSerializer.serialize_entities(event).first, current_user.id)
        event_data[:readraptor_tracking_url] = tracker.url
        event_data[:tips] = event_data[:tips].to_json
      end

      event_name = event.class.slug

      template_root = Rails.root.join('app', 'templates', 'events')
      template_path = template_root.join(
        event_name.pluralize,
        "_#{event_name}.mustache"
      )

      [event, Mustache.render(File.read(template_path), event_data)]
    end
  end
end
