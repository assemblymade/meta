class AttachmentSerializer < ActiveModel::Serializer
  # include Sprockets::Helpers::RailsHelper
  # include Sprockets::Helpers::IsolatedHelper
  include ActionView::Helpers::AssetTagHelper

  attributes :id, :name, :size, :content_type, :href, :created_at, :firesize_url, :extension

  has_one :user

  def href
    "#{ENV['ATTACHMENT_ASSET_HOST']}/#{object.key}"
  end

  def created_at
    object.created_at.iso8601
  end

  def firesize_url
    ENV['FIRESIZE_URL']
  end

  def extension
    object.name.split('.', 2)[1]
  end
end
