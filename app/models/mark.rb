class Mark < ActiveRecord::Base
  include ActiveRecord::UUID
  include Kaminari::ActiveRecordModelExtension

  has_many :markings
  has_many :tasks, :through => :markings, source: :markable, source_type: 'Wip'
  has_many :discussions, :through => :markings
  has_many :products, :through => :markings, source: :markable, source_type: 'Product'
  has_many :posts, :through => :markings
  has_many :users, through: :markings
  has_many :watchings, :as => :watchable
  has_many :watchers, -> { where(watchings: { unwatched_at: nil }) }, :through => :watchings, :source => :user
  belongs_to :mark_stem, touch: true, counter_cache: true

  belongs_to :mark_cluster

  after_commit :assign_stem, on: :create

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

  def correlated_marks
    markings = Marking.where(markable_type: "Mark").where(mark: self).order('weight desc').limit(10)
    valid_markings = markings.where.not(markable_id: nil)
    vector = valid_markings.map{|a| [a.markable.id, a.weight.to_f / (a.markable.markings.count**0.3)+1]}
    s = Math.sqrt(vector.sum{|a| a[1]**2})
    if s > 0
      vector.map{|a| [a[0], a[1]/s ]}.sort_by{|a| a[1]}.reverse
    else
      []
    end
  end

  def assign_stem
    mark_name = name.gsub(/[^0-9a-z]/i, ' ').squeeze
    ms = MarkStem.where(name: mark_name.try(:stem)).first_or_create
    update_attribute(:mark_stem_id, ms.id) if mark_stem_id.blank? || mark_stem_id != ms.id
    ms.name
  end

  def assign_cluster(mark_cluster)
    self.update!(mark_cluster_id: mark_cluster.id)
  end

end
