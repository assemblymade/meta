require 'activerecord/uuid'

class ProductJob < ActiveRecord::Base
  include ActiveRecord::UUID
  extend FriendlyId
  friendly_id :category, use: :slugged

  validates :category, presence: true
  validates :description, presence: true


  belongs_to :product
  belongs_to :user

  has_many :product_roles

  def has_role?(user)
    if user.blank?
      return false
    end
    self.product_roles.each do |role|
      if role.user_id == user.id
        return true
      end
    end
    return false
  end
  
end
