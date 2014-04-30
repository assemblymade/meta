class ProductShortcut < ActiveRecord::Base
  belongs_to :product
  belongs_to :target, polymorphic: true, validate: false

  validate :number, uniqueness: { scope: :product }

  def self.create_for!(product, target)
    product.with_lock do
      prev_max = ProductShortcut.where(product_id: product.id).maximum(:number) || 0
      number = prev_max + 1

      ProductShortcut.create! product_id: product.id, number: number, target: target
    end
  end
end
