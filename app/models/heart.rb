class Heart < ActiveRecord::Base
  belongs_to :heartable, polymorphic: true, counter_cache: true, touch: true
  belongs_to :target_user, class_name: 'User'
  belongs_to :user

  scope :unsent, -> { where(sent_at: nil) }

  after_commit :update_hearts_received_count, on: :create

  before_validation :set_target_user_id, on: :create
  before_validation :set_product_id, on: :create
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
      user.update(
        hearts_received: Heart.where(target_user_id: user.id).count,
        last_hearted_at: self.created_at
      )
    end
  end

  def set_target_user_id
    self.target_user_id = heartable.try(:user_id) || heartable.source_id
  end

  def set_product_id
    self.product_id = heartable.try(:product).try(:id)
  end
end
