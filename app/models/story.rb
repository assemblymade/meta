# This class is the list of notifications that appear in the bell.
# It needs a new name as NewsFeedItems will soon be renamed to Stories.
# Perhaps it could be called StoryUpdate, as it stores updates to a story like
# Chuck and 3 others like your comment

class Story < ActiveRecord::Base
  has_many :actors, through: :activities, source: :actor, source_type: 'User'
  has_many :activities

  attr_accessor :socket_id

  PUBLISHABLE_ACTIVITIES = [
    ["Comment", "Discussion"],
    ["Comment", "Post"],
    ["Comment", "Task"],
    ["Comment", "TeamMembership"],
    ["Introduce", "Product"],
    ["Post", "Post"],
    ["Start", "Wip"],
  ].each_with_object({}) {|keys, h| h[keys] = true }

  def self.to_noun(o)
    o.class.name.split('::').last.gsub(/Decorator$/,'')
  end

  def self.should_publish?(activity)
    PUBLISHABLE_ACTIVITIES[[activity.verb, to_noun(activity.target)]].tap do |o|
      puts "should publish? #{[activity.verb, to_noun(activity.target)]} #{o}"
    end
  end

  def self.associated_with_ids(entity)
    Rails.cache.fetch(['story_ids', entity.id]) do
      activities = Activity.where(target_id: entity.id)

      if activities.empty?
        activities = Activity.where(subject_id: entity.id)
      end

      activities.map(&:story_id).uniq
    end
  end

  def self.associated_with(entity)
    Story.where(id: associated_with_ids(entity))
  end

  def subject
    activities.first.subject
  end

  def target
    activities.first.target
  end

  def reader_ids
    target.follower_ids - actor_ids
  end

  def notify_by_email(user)
    # don't send emails for every story created
  end

  def sentences
    StorySentences.new(self).as_json
  end
end
