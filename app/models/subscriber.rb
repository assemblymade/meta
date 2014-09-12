class Subscriber < ActiveRecord::Base
  belongs_to :user
  belongs_to :product

  default_scope -> { where(deleted_at: nil) }

  validates :product, uniqueness: { scope: :email }

  after_commit -> { product.update_watchings_count! }


  def self.upsert!(product, user)
    if subscriber = Subscriber.unscoped.find_by(product: product, user: user)
      subscriber.deleted_at = nil
      subscriber.email = user.email
      subscriber.save!
    else
      Subscriber.create!(product: product, user: user, email: user.email)
    end
  end

  def self.unsubscribe!(product, user)
    if s = Subscriber.unscoped.find_by(product: product, user: user)
      s.update! deleted_at: Time.now
    end
  end
end
