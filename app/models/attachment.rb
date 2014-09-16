require 'activerecord/uuid'

class Attachment < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :user

  has_many :deliverables

  before_save :set_asset_path

  validates :name, presence: true

  def key
    # TODO: (whatupdave) rename the files in S3 to the actual file names so they download properly
    asset_path || File.join("attachments", user_id, "#{id}#{Rack::Mime::MIME_TYPES.invert[content_type]}")
  end

  def url
    URI.encode(File.join(attachment_host, asset_path))
  end

  # private

  def set_asset_path
    self.asset_path = File.join("attachments", SecureRandom.uuid, name)
  end

  def attachment_host
    ENV["ATTACHMENT_ASSET_HOST"] || ''
  end
end
