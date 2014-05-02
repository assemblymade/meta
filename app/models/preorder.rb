require 'activerecord/uuid'

class Preorder < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :user
  belongs_to :perk
  delegate :product, :to => :perk

  validates :user,    presence: true
  validates :perk,    presence: true
  validates :card_id, presence: true
  validates :amount,  presence: true,
                      numericality: { only_integer: true, greater_than: 0 }

  scope :since, ->(time) { where('created_at >= ?', time) }

  before_validation :set_amount_from_perk, :on => :create

  def set_amount_from_perk
    self.amount ||= (perk.discount[:amount]).to_i
  end
end
