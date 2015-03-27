# TODO: Needs a new name
# suggestions: Thread, Story, Discussion

class NewsFeedItem < ActiveRecord::Base
  include Kaminari::ActiveRecordModelExtension

  belongs_to :target, polymorphic: true
  belongs_to :target_task, class_name: 'Task', foreign_key: 'target_id'

  belongs_to :product
  belongs_to :source, class: User

  has_many :followings, class_name: 'Watching', as: :watchable
  has_many :followers, through: :followings, source: :user
  has_many :hearts, as: :heartable, after_add: [:follow_author, :hearted]
  has_many :comments, class_name: 'NewsFeedItemComment', after_add: :comment_added
  has_one :last_comment, -> { order('news_feed_item_comments.created_at DESC').limit(1) }, class_name: 'NewsFeedItemComment'

  default_scope -> { where(deleted_at: nil) }

  validates :target, presence: true

  before_validation :ensure_last_commented_at, on: :create

  after_commit :follow_self, on: :create

  scope :public_items, -> {
    joins(:product).
    where.not(products: {state: %w(stealth reviewing) }).
    where.not(product_id: (Product.private_ids + [Product.meta_id]))
  }

  scope :unarchived_items, -> { where(archived_at: nil) }
  scope :archived_items, -> { where.not(archived_at: nil) }

  scope :for_feed, -> {
    public_items.
      unarchived_items.
      order(last_commented_at: :desc)
  }

  scope :with_mark, -> (mark) {
    joins('INNER JOIN markings ON news_feed_items.target_id = markings.markable_id').
      where(markings: { mark_id: Mark.find_by(name: mark) })
  }

  scope :with_target_type, -> (type) {
    where(target_type: type)
  }

  def self.create_with_target(target)
    create!(
      product: target.try(:product),
      source: target.user,
      target: target
    )
  end

  def author_id
    self.source_id # currently this is always a user, might be polymorphic in the future
  end

  def user
    self.source
  end

  def hearted(o)
    target.try(:hearted)
  end

  def unhearted(heart)
    if target.respond_to?(:unhearted)
      target.unhearted(heart)
    end
  end

  def product?
    !!target.try(:product)
  end

  def events
    Event.where(wip: self.target).where.not(type: 'Event::Comment')
  end

  def ensure_last_commented_at
    self.last_commented_at = Time.now
  end

  def update_task!(index, checked)
    if self.target && (text = target.description)
      i = 0
      new_text = text.gsub(/^(\s*)- \[(x| )\](.*)$/) do |match|
        replacement = if i == index
          "#{$1}- [#{checked ? 'x' : ' '}] #{$3.strip}"
        else
          match
        end
        i += 1

        replacement
      end

      target.update!(description: new_text)
    end
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
      Watching.auto_watch!(user, self)
    end
  end

  def follow_self
    Watching.watch!(self.source, self)
  end

  def update_watchings_count!
    update! watchings_count: followings.count
  end
end
