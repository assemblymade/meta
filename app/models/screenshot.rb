class Screenshot < ActiveRecord::Base
  belongs_to :asset

  validates :position, presence: true,
                       uniqueness: { scope: :asset }

  def url
    asset.url
  end
end
