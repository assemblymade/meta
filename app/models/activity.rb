class Activity < ActiveRecord::Base
  belongs_to :actor,   polymorphic: true
  belongs_to :subject, polymorphic: true
  belongs_to :target,  polymorphic: true

  has_many :tips, foreign_key: 'via_id'

  validates :actor,   presence: true
  validates :subject, presence: true
  validates :target,  presence: true

  attr_accessor :socket_id

  def self.publish!(opts)
    create!(opts).tap do |a|
      if a.target.class == Wip
        auto_subscribe!(a.actor, a.target.product)
      end

      PublishActivity.perform_async(a.id)
    end
  end

  def self.auto_subscribe!(actor, target)
    Watching.auto_subscribe!(actor, target)
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
end
