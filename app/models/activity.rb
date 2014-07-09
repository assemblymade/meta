class Activity < ActiveRecord::Base
  belongs_to :actor,   polymorphic: true
  belongs_to :subject, polymorphic: true
  belongs_to :target,  polymorphic: true

  validates :actor,   presence: true
  validates :subject, presence: true
  validates :target,  presence: true

  attr_accessor :socket_id

  def self.publish!(opts)
    a = create!(opts)
    a.publish
    a
  end

  def streams
    stream_targets.map do |o|
      ActivityStream.new(o)
    end
  end

  def stream_targets
    [actor, target]
  end

  def publish
    streams.each do |stream|
      stream.push(self)
    end
  end

  # make this object tippable
  def tip_receiver
    actor
  end
end
