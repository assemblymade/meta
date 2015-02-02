class ScreenshotSerializer < ActiveModel::Serializer
  attributes :id, :url

  def url
    object.asset.url
  end
end
