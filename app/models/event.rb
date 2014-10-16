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

  after_commit -> { self.wip.event_added(self); }, on: :create
  after_commit -> { Indexer.perform_async(:index, Wip.to_s, self.wip.id) }

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
    MAILABLE.include? self.class
  end

  def notify_users!(followers)
    (self.mentioned_users - [self.user]).each do |mentioned_user|
      notify_by_email(mentioned_user)
    end

    update_pusher(followers, mentioned_users)
  end

  def notify_by_email(user)
    # hack to not send out immediate emails for chat messages
    return if wip.chat?

    if notify_by_email? && !user.mail_never?
      EmailLog.send_once user.id, self.id do
        WipMailer.delay(queue: 'mailer').wip_event_added(user.id, self.id)
      end
    end
  end

  def update_pusher(users, mentioned_users)
    event_hash = EventSerializer.for(self, nil).as_json.merge(socket_id: self.socket_id)
    event_hash[:mentions] = mentioned_users.map(&:username)
    event_hash.delete :body
    event_hash[:body_html] = truncate(event_hash[:body_html], length: 200)

    # pushes a 'chat' event to the user's channel to trigger
    # it to call for updates. This is part of notifications
    channels = users.map{|u| "@#{u.username}"} + [wip.push_channel]
    PusherWorker.perform_async channels, 'event.added', event_hash.to_json
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

  def to_param
    number
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

  def self.create_from_comment(wip, type, body, user, socket_id = nil)
    case type.to_s
    when Event::Close.to_s
      wip.close!(user, body)

    when Event::ReviewReady.to_s
      wip.review_me!(user)

    when Event::Reopen.to_s
      wip.reopen!(user, body)

    when Event::Comment.to_s
      wip.comments.create(user_id: user.id, body: body, socket_id: socket_id)

    else
      raise 'Unknown event'
    end
  end
end
