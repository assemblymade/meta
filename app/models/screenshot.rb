class Screenshot < ActiveRecord::Base
  belongs_to :asset

  validates :position, presence: true

  def url
    asset.url
  end
end
