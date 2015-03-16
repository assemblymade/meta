class AppSerializer < ApplicationSerializer
  attributes :name, :pitch, :slug, :logo_url, :try_url, :search_tags

  def logo_url
    object.full_logo_url
  end

  def search_tags
    l = Set.new(object.tags)
    l.merge(object.marks.limit(4).map(&:name))
    l
  end
end
