class Activity < ActiveRecord::Base
  belongs_to :actor,   polymorphic: true
  belongs_to :subject, polymorphic: true
  belongs_to :target,  polymorphic: true
  
  attr_accessor :socket_id

  def self.publish!(opts)
    a = create!(opts)
    a.publish
    a
  end

  def streams
    [actor, subject, target].compact.each_with_object(Set.new) do |o, set|
      set.merge(o.interested) if o.respond_to?(:interested)
    end.map {|o| ActivityStream.new(o) }
  end

  def publish
    streams.each do |stream|
      stream.push(self)
    end
  end
end
