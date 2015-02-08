class Asset < ActiveRecord::Base
  include Kaminari::ActiveRecordModelExtension

  belongs_to :product
  belongs_to :user
  belongs_to :attachment

  has_one :room, as: :target
  has_one :screenshot

  delegate :url, to: :attachment

  default_scope -> { where('assets.deleted_at is null') }

  def delete!
    Asset.transaction do
      screenshot.update(deleted_at: Time.now) if screenshot
      attachment.update(deleted_at: Time.now) if attachment

      update(deleted_at: Time.now)
    end
  end
end
