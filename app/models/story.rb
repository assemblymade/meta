# This class is the list of notifications that appear in the bell.
# It needs a new name as NewsFeedItems will soon be renamed to Stories.
# Perhaps it could be called StoryUpdate, as it stores updates to a story like
# Chuck and 3 others like your comment

class Story < ActiveRecord::Base
  include Kaminari::ActiveRecordModelExtension

  has_many :actors, through: :activities, source: :actor, source_type: 'User'
  has_many :activities

  attr_accessor :socket_id

  delegate :url_params, to: :subject, allow_nil: true

  PUBLISHABLE_VERBS = [
    "Award", "Close", "Comment", "Introduce", "Post", "Start"
  ].each_with_object({}) {|keys, h| h[keys] = true }

  PUBLISHABLE_ACTIVITIES = [
    ["Post", "Post", "Product"],
  ].each_with_object({}) {|keys, h| h[keys] = true }

  def self.to_noun(o)
    o.class.name.split('::').last.gsub(/Decorator$/,'')
  end

  def self.should_publish?(activity)
    # puts ">>>>> should publish? #{[activity.verb, to_noun(activity.subject), to_noun(activity.target)]}"

    return false unless activity.actor.flagged_at.nil?
    return true if PUBLISHABLE_VERBS.include?(activity.verb)

    PUBLISHABLE_ACTIVITIES[[activity.verb, to_noun(activity.subject), to_noun(activity.target)]]
  end

  def self.associated_with_ids(entity)
    Rails.cache.fetch(['story_ids.2', entity]) do
      activities = Activity.where(subject_id: entity.id).to_a + Activity.where(target_id: entity.id).to_a

      activities.map(&:story_id).uniq.compact
    end
  end

  def self.associated_with(entity)
    Story.where(id: associated_with_ids(entity))
  end

  # TODO: (whatupdave) we should have the story belongs_to a nfi
  # this is a crutch until we migrate the data
  def news_feed_item
    subject.try(:news_feed_item) || target.try(:news_feed_item)
  end

  def subject
    activities.first.subject
  end

  def target
    activities.first.target
  end

  def reader_ids
    # if the story has been created on a product, send it to the product followers
    # otherwise send it to the nfi followers
    if target.is_a? Product
      target.follower_ids - actor_ids
    else
      news_feed_item.follower_ids - actor_ids
    end
  end

  def notify_by_email(user)
    # don't send emails for every story created
  end

  def sentences
    StorySentences.new(self).as_json
  end
end
