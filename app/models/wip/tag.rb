require 'activerecord/uuid'

class Wip::Tag < ActiveRecord::Base
  include ActiveRecord::UUID

  has_many :taggings, class_name: 'Wip::Tagging', foreign_key: 'wip_tag_id'
  has_many :tasks, :through => :taggings, :source => :wip
  has_many :discussions, :through => :taggings, :source => :wip
  has_many :watchings, :as => :watchable
  has_many :watchers, :through => :watchings, :source => :user

  validates :name, presence: true, length: { minimum: 2 }

  COLOR_RULES = {
    'bug' => 'F40',
    'yc'  => 'F60'
  }

  def self.color_for(name)
    hex = COLOR_RULES[name] || autocolor(name)
    "##{hex}"
  end

  def color
    self.class.color_for(name)
  end

  def follow!(user)
    Watching.watch!(user, self)
  end

  def unfollow!(user)
    Watching.unwatch!(user, self)
  end

  def to_param
    name
  end

private

  def self.autocolor(text)
    Digest::MD5.hexdigest("a#{text}").to_s[0..5].upcase
  end

end