class Room < ActiveRecord::Base
  belongs_to :product
  belongs_to :target, polymorphic: true, validate: false

  has_many :watchings, :as => :watchable
  has_many :watchers, -> { where(watchings: { unwatched_at: nil }) }, :through => :watchings, :source => :user

  validate :number, uniqueness: { scope: :product }

  def self.create_for!(product, target)
    product.with_lock do
      prev_max = where(product_id: product.id).maximum(:number) || 0
      number = prev_max + 1
      create!(product: product, number: number, target: target)
    end
  end

  def root?
    self.product == self.target
  end

  def activity_stream
    ActivityStream.new(self)
  end

end
