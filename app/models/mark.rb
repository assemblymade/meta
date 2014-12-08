class Mark < ActiveRecord::Base
  include ActiveRecord::UUID

  has_many :markings
  has_many :tasks, :through => :markings, source: :markable, source_type: 'Wip'
  has_many :discussions, :through => :markings
  has_many :products, :through => :markings
  has_many :posts, :through => :markings
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
