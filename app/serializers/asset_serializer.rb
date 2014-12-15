class AssetSerializer < ApplicationSerializer
  include FiresizeHelper

  attributes :thumbnail_url

  has_one :attachment

  def thumbnail_url
    firesize(object.url, "330x220")
  end
end
