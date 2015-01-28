class AppSerializer < ApplicationSerializer
  attributes :name, :pitch, :slug, :logo_url, :try_url, :search_tags

  def logo_url
    object.full_logo_url
  end

  def search_tags
    object.tags
  end
end
