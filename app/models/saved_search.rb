class SavedSearch < ActiveRecord::Base
  validates :query, presence: true, uniqueness: true

  belongs_to :user
end