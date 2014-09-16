require 'activerecord/uuid'

class Post < ActiveRecord::Base
  include ActiveRecord::UUID
  include Kaminari::ActiveRecordModelExtension
  extend FriendlyId

  belongs_to :product
  belongs_to :author, class_name: 'User'

  validates :product, presence: true
  validates :author,  presence: true
  validates :title,   uniqueness: true, presence: true
  validates :slug,    presence: true
  validates :summary, length: { minimum: 2, maximum: 140 }, allow_blank: true

  friendly_id :title, use: :slugged

  def summary
    super || body.split("\n").first
  end

  def follower_ids
    product.follower_ids
  end

  def flagged?
    flagged_at.present?
  end

end
