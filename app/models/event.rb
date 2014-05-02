require 'activerecord/uuid'

# TODO: (whatupdave) rename this. These are wip events (comments, opens, awards etc)
class Event < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :user
  belongs_to :wip, touch: true, counter_cache: true

  has_many :activities, as: :subject
  has_many :tips, foreign_key: 'via_id'
  has_many :tippers, through: :tips, source: :from

  delegate :product, :to => :wip

  acts_as_sequenced scope: :wip_id, column: :number, start_at: 1

  MAILABLE = [
    Event::Close,
    Event::Comment,
    Event::CommitReference,
    Event::Reopen,
    Event::Win
  ]

  def self.analytics_name
    "wip.#{slug}"
  end

  def awardable?
    false
  end

  def tippable?
    false
  end

  def editable?
    false
  end

  def notify_by_email?
    MAILABLE.include? self.class
  end

  def notify_user!(user)
    if notify_by_email? && !user.mail_never?
      WipMailer.delay.wip_event_added(user.id, self.id)
    end

    if self.is_a? ::Event::Comment
      wip.updates.for(user).new_comment!
    end
  end

  def notify_users
    users = self.body.scan(/\@(\w+)/).flatten
    # validate users
    users = User.where(:username => users)
    # notify users individually
    users.each do |user|
      self.notify_user!(user)
    end
    return users
  end

  def total_tips
    tips.sum(:cents)
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
        tracker = ReadraptorTracker.new(event, current_user.id)
        event_data[:readraptor_tracking_url] = tracker.url
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

  def self.create_from_comment(wip, type, body, user)
    case type.to_s
    when Event::Close.to_s
      wip.close!(user, body)

    when Event::Reopen.to_s
      wip.reopen!(user, body)

    when Event::Promotion.to_s
      wip.promote!(user, body)

    when Event::Demotion.to_s
      wip.demote!(user, body)

    when Event::Comment.to_s
      wip.comments.create(user_id: user.id, body: body)

    else
      raise 'Unknown event'
    end
  end
end
