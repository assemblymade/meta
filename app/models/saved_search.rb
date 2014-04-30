class SavedSearch < ActiveRecord::Base
  validates :query, presence: true, uniqueness: true
end