class NewsFeedItem < ActiveRecord::Base
  include Kaminari::ActiveRecordModelExtension

  belongs_to :target, polymorphic: true
  belongs_to :product
  belongs_to :source, class: User

  has_many :followings, class_name: 'Watching', as: :watchable
  has_many :followers, through: :followings, source: :user
  has_many :hearts, as: :heartable, after_add: :follow_author
  has_many :comments, class_name: 'NewsFeedItemComment', after_add: :follow_author

  before_validation :ensure_last_commented_at, on: :create

  after_commit :follow_self, on: :create

  scope :public_items, -> { joins(:product).where('products.state not in (?)', ['stealth', 'reviewing']) }

  def self.create_with_target(target)
    # Prevent @kernel from appearing in the News Feed
    # (gross)
    return if target.user.username == 'kernel'
    create!(
      product: target.try(:product),
      source: target.user,
      target: target
    )
  end

  def author_id
    self.source_id # currently this is always a user, might be polymorphic in the future
  end

  def events
    Event.where(wip: self.target).where.not(type: 'Event::Comment')
  end

  def ensure_last_commented_at
    unless self.last_commented_at
      self.update!(last_commented_at: Time.now)
    end
  end

  def url_params
    target.url_params
  end

  def follow_author(o)
    Watching.watch!(o.user, self)
  end

  def follow_self
    Watching.watch!(self.source, self)
  end
end
