class AppSerializer < ApplicationSerializer
  attributes :name, :pitch, :slug, :logo_url, :try_url, :popular_open_tags

  def logo_url
    object.logo_url == Product::DEFAULT_IMAGE_PATH ? File.join(root_url, Product::DEFAULT_IMAGE_PATH) : object.logo_url
  end

  def popular_open_tags
    ['design', 'ruby']
  end
end
