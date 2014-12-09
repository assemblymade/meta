# This class is the list of notifications that appear in the bell.
# It needs a new name as NewsFeedItems will soon be renamed to Stories.
# Perhaps it could be called StoryUpdate, as it stores updates to a story like
# Chuck and 3 others like your comment

class Story < ActiveRecord::Base
  belongs_to :subject, polymorphic: true
  has_many :story_actors
  has_many :actors, through: :story_actors, source: :user

  validates :subject, presence: true

  has_many :activities # TODO: deprecated


  attr_accessor :socket_id

  STREAM_MAPPINGS = {
    # ["Assign", "Discussion"]                => :wip_subscribers,
    # ["Assign", "Task"]                      => :wip_subscribers,
    ["Award", "Wip"]                       => :wip_subscribers,
    ["Close", "Wip"]                        => :wip_subscribers,
    ["Comment", "Discussion"]               => :wip_subscribers,
    ["Comment", "Post"]                     => :product_subscribers,
    ["Comment", "TeamMembership"]           => :product_subscribers,
    ["Comment", "Wip"]                      => :wip_subscribers,
    # ["CreateCoreTeamMembership", "Product"] => :product_subscribers,
    # ["Found", "Product"]             => :product_subscribers,
    # ["GitPush", "Work"]                     => :product_subscribers,
    ["Introduce", "Product"]                => :product_subscribers,
    # ["Launch", "Product"]                   => :product_subscribers,
    # ["Open", "Discussion"]                  => :wip_subscribers,
    # ["Open", "Task"]                        => :wip_subscribers,
    ["Post", "Post"]                        => :product_subscribers,
    # ["Post", "Discussion"]                  => :wip_subscribers,
    # ["Post", "Task"]                        => :wip_subscribers,
    # ["Reference", "Discussion"]             => :wip_subscribers,
    # ["Reference", "Task"]                   => :wip_subscribers,
    # ["Reference", "Wip"]                    => :wip_subscribers,
    ["Start", "Wip"]                       => :product_subscribers,
    # ["Unassign", "Discussion"]              => :wip_subscribers,
    # ["Unassign", "Task"]                    => :wip_subscribers,
    # ["Update", "Discussion"]                => :wip_subscribers,
    # ["Update", "Task"]                      => :wip_subscribers,
  }

  BODY_MAPPINGS = {
    ["Close", "Discussion"]                 => :subject_body,
    ["Close", "Task"]                       => :subject_body,
    ["Close", "Wip"]                        => :subject_body,
    ["Comment", "Discussion"]               => :subject_body,
    ["Comment", "Task"]                     => :subject_body,
    ["Comment", "Wip"]                      => :subject_body,
    ["Post", "Post"]                        => :subject_body,
    ["Start", "Task"]                       => :description
  }

  def self.should_publish?(activity)
    puts "should publish? #{[activity.verb, activity.verb_subject]}"
    STREAM_MAPPINGS[[activity.verb, activity.verb_subject]]
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

  def self.subject_serializer(subject)
    "Story::#{subject.class.model_name.name}Serializer".constantize rescue nil
  end

  def reader_ids
    send STREAM_MAPPINGS.fetch([verb, subject_type])
  end

  def body_preview
    if mapping = BODY_MAPPINGS[[verb, subject_type]]
      send mapping
    end
  end

  def notify_by_email(user)
    # don't send emails for every story created
  end

  def sentences
    StorySentences.new(self).as_json
  end

  # private

  def product_subscribers
    subject.follower_ids
  end

  def wip_subscribers
    subject.follower_ids
  end

  def description
    subject.description
  end

  def subject_body
    subject.try(:sanitized_body)
  end
end
