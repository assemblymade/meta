class Heart < ActiveRecord::Base
  belongs_to :user
  belongs_to :heartable, polymorphic: true, counter_cache: true, touch: true

  scope :unsent, -> { where(sent_at: nil) }

  after_commit :update_hearts_received_count, on: :create

  validates :heartable_id, uniqueness: { scope: :user }
  validates :user, presence: true

  def product
    heartable.try(:product)
  end

  def self.store_data(heartables)
    heartables.map do |h|
      {
        id: h.id,
        heartable_type: h.class.name,
        hearts_count: h.hearts_count
      }
    end
  end

  def update_hearts_received_count
    if user = heartable.user
      user.update_column(
        :hearts_received, NewsFeedItem.where(source_id: user.id).sum(:hearts_count) +
                         NewsFeedItemComment.where(user_id: user.id).sum(:hearts_count)
      )
    end
  end
end
