class ProductMetric < ActiveRecord::Base
  belongs_to :product

  validates :product_id, uniqueness: true
end
