class Story < ActiveRecord::Base
  has_many :activities

  attr_accessor :socket_id

  STREAM_MAPPINGS = {
    # ["Assign", "Discussion"]                => :wip_subscribers,
    # ["Assign", "Task"]                      => :wip_subscribers,
    ["Award", "Task"]                       => :wip_subscribers,
    ["Close", "Discussion"]                 => :wip_subscribers,
    ["Close", "Task"]                       => :wip_subscribers,
    ["Close", "Wip"]                        => :wip_subscribers,
    ["Comment", "Discussion"]               => :wip_subscribers,
    ["Comment", "Task"]                     => :wip_subscribers,
    ["Comment", "Wip"]                      => :wip_subscribers,
    # ["CreateCoreTeamMembership", "Product"] => :product_subscribers,
    # ["FoundProduct", "Product"]             => :product_subscribers,
    # ["GitPush", "Work"]                     => :product_subscribers,
    # ["Introduce", "TeamMembership"]         => :product_subscribers,
    # ["Launch", "Product"]                   => :product_subscribers,
    # ["Open", "Discussion"]                  => :wip_subscribers,
    # ["Open", "Task"]                        => :wip_subscribers,
    # ["Post", "Discussion"]                  => :wip_subscribers,
    # ["Post", "Task"]                        => :wip_subscribers,
    # ["Reference", "Discussion"]             => :wip_subscribers,
    # ["Reference", "Task"]                   => :wip_subscribers,
    # ["Reference", "Wip"]                    => :wip_subscribers,
    # ["Start", "Discussion"]                 => :product_subscribers,
    # ["Start", "Task"]                       => :product_subscribers,
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
  }


  def stream_targets
    send STREAM_MAPPINGS.fetch([verb, subject_type])
  end

  def self.should_publish?(activity)
    STREAM_MAPPINGS[[activity.verb, activity.verb_subject]]
  end

  def body_preview
    if mapping = BODY_MAPPINGS[[verb, subject_type]]
      send mapping
    end
  end

  # private

  def product_subscribers
    subjects.first.try(:product).try(:watchings).try(:subscribed).map(&:user)
  end

  def wip_subscribers
    subjects.first.wip.watchings.subscribed.map(&:user)
  end

  def subject_body
    activities.first.subject.sanitized_body
  end

  def subjects
    activities.map(&:subject)
  end
end
