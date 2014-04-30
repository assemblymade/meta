require 'activerecord/uuid'

class Perk < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :product
  has_many :preorders

  validates :name,   presence: true
  validates :amount, presence: true,
                    numericality: { only_integer: true, greater_than: 0 }

  def discount
    case product.stage
    when :validating
      {
        :variation => :validation_60,
        :amount => amount * 0.4
      }
    when :building
      {
        :variation => :building_60,
        :amount => amount * 0.4
      }
    when :shipping
      {
        :variation => :shipping_0,
        :amount => amount
      }
    end
  end

  def discount_percent_off
    discount_percent = 1 - (discount_amount / amount.to_f)
    (discount_percent * 100).to_i
  end

  def discount_amount
    discount.fetch(:amount)
  end

end
