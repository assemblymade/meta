class Screenshot < ActiveRecord::Base
  belongs_to :asset

  validates :position, presence: true,
                       uniqueness: { scope: :asset }

   default_scope -> { where('screenshots.deleted_at is null') }

  def url
    asset.url
  end
end
