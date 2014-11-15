class Tag < ActiveRecord::Base
  include ActiveRecord::UUID

  has_many :taggings
  has_many :tasks, :through => :taggings
  has_many :discussions, :through => :taggings
  has_many :products, :through => :taggings
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
    %w(
      simple
      challenging
      frontend
      backend
      development
      android
      ios
      mobile
      design
      logo
      product
      copy
      bug
      api
    )
  end

end
