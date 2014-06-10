class ProductInterest < ActiveRecord::Base
  belongs_to :user
  belongs_to :product
  belongs_to :interest
end
