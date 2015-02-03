class ScreenshotSerializer < ActiveModel::Serializer
  attributes :created_at, :id, :url

  def url
    object.asset.url
  end
end
