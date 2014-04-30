class WhiteboardAssetSerializer < ActiveModel::Serializer
  include ActionView::Helpers::AssetTagHelper

  attributes :id, :url
  attributes :image_url, :event_url, :width, :height

  # TODO WhiteboardAssets don't belong to a product
  def url
    product_whiteboard_path(object.product, object)
  end

  def event_url
    product_wip_path(product, wip, anchor: "event-#{event.number}")
  end

  def author
    UserSerializer.new(event.user)
  end

  def image_url
    "#{ENV['WHITEBOARD_ASSET_HOST']}/#{object.s3_key}"
  end

  def width
    300
  end

  def height
    ((width / object.width.to_f) * object.height).to_i
  end

  def event
    object.comment
  end

  def wip
    event.wip
  end

  def product
    wip.product
  end
end
