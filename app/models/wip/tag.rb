require 'activerecord/uuid'

class Wip::Tag < ActiveRecord::Base
  include ActiveRecord::UUID

  has_many :taggings, class_name: 'Wip::Tagging', foreign_key: 'wip_tag_id'
  has_many :tasks, :through => :taggings, :source => :wip
  has_many :discussions, :through => :taggings, :source => :wip
  has_many :watchings, :as => :watchable
  has_many :watchers, -> { where(watchings: { unwatched_at: nil }) }, :through => :watchings, :source => :user

  validates :name, length: { minimum: 2 }, allow_blank: true

  def follow!(user)
    Watching.watch!(user, self)
  end

  def unfollow!(user)
    Watching.unwatch!(user, self)
  end

  def to_param
    name
  end

  def self.suggested_tags
    QueryMarks.new.leading_marks_systemwide(13).keys
  end

end
