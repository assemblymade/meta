class Showcase < ActiveRecord::Base
  has_many :showcase_entries

  scope :active, -> { where(ended_at: nil) }

  def add!(product)
    ShowcaseEntry.find_or_create_by!(showcase: self, product: product)
  end
end
