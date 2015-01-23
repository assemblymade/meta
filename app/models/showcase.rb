class Showcase < ActiveRecord::Base
  has_many :showcase_entries

  scope :active, -> { where(ended_at: nil) }
end
