class ProductShallowSerializer < ApplicationSerializer
  attributes :name, :pitch, :slug, :logo_url, :url, :wips_count, :partners_count, :total_visitors
  attributes :homepage_url

  def logo_url
    object.full_logo_url
  end

  def url
    product_path(object) rescue nil
  end

  cached

  def cache_key
    object
  end
end
