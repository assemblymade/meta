require 'activerecord/uuid'

class Product::Subscription < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :product
  belongs_to :user

  def self.subscribed?(user, product)
    where(user: user, product_id: product.id).any?
  end
end
