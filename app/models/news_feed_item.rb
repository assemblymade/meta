# Possible names: Thread, Story, ...

class NewsFeedItem < ActiveRecord::Base
  include Kaminari::ActiveRecordModelExtension

  belongs_to :target, polymorphic: true
  belongs_to :product
  belongs_to :source, class: User

  has_many :followings, class_name: 'Watching', as: :watchable
  has_many :followers, through: :followings, source: :user
  has_many :hearts, as: :heartable, after_add: [:follow_author, :hearted]
  has_many :comments, class_name: 'NewsFeedItemComment', after_add: :comment_added

  validates :target, presence: true

  before_validation :ensure_last_commented_at, on: :create

  after_commit :follow_self, on: :create

  scope :public_items, -> { joins(:product).where.not(products: {state: %w(stealth reviewing) }).where.not(product_id: (Product.private_ids + [Product.meta_id])) }

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

  def hearted(o)
    target.try(:hearted)
  end

  def unhearted
    target.try(:unhearted)
  end

  def events
    Event.where(wip: self.target).where.not(type: 'Event::Comment')
  end

  def ensure_last_commented_at
    self.last_commented_at = Time.now
  end

  def url_params
    target.url_params
  end

  def follow_author(o)
    Watching.watch!(o.user, self)
  end

  def comment_added(o)
    update!(last_commented_at: o.created_at)
    [o.user, o.mentioned_users].flatten.uniq.each do |user|
      Watching.watch!(user, self)
    end
  end

  def follow_self
    Watching.watch!(self.source, self)
  end

  def update_watchings_count!
    update! watchings_count: followings.count
  end
end
