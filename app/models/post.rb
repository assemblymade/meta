require 'activerecord/uuid'

class Post < ActiveRecord::Base
  include ActiveRecord::UUID
  extend FriendlyId

  belongs_to :product
  belongs_to :author, class_name: 'User'

  validates :title, uniqueness: true, presence: true
  validates :slug, presence: true
  validates :summary, length: { minimum: 2, maximum: 140 }, allow_blank: true

  friendly_id :title, use: :slugged

end
