class Viewing < ActiveRecord::Base
  belongs_to :user
  belongs_to :viewable, polymorphic: true
  validates :weight, presence: true
end
