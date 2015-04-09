require 'activerecord/uuid'

class Attachment < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :user

  has_many :deliverables

  before_validation :set_asset_path, on: :create

  validates :name, presence: true

  default_scope -> { where('attachments.deleted_at is null') }

  def assign_to_product!(product, user)
    asset_to_create = {
      attachment_id: self.id,
      name: self.name
    }

    asset = product.assets.create(asset_to_create.merge(user: user))
    Room.create_for!(asset.product, asset)
  end

  def key
    # TODO: (whatupdave) rename the files in S3 to the actual file names so they download properly
    asset_path || File.join("attachments", user_id, "#{id}#{Rack::Mime::MIME_TYPES.invert[content_type]}")
  end

  def url
    URI.encode(File.join(attachment_host, asset_path))
  end

  # private

  def set_asset_path
    self.asset_path ||= File.join("attachments", SecureRandom.uuid, name)
  end

  def attachment_host
    ENV["ATTACHMENT_ASSET_HOST"] || ''
  end
end
