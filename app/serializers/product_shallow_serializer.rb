class ProductShallowSerializer < ApplicationSerializer
  attributes :name, :pitch, :slug, :logo_url, :url, :wips_count, :partners_count
  attributes :homepage_url

  def logo_url
    image_url = if object.logo.present?
      object.logo.url
    elsif object.poster.present?
      object.poster_image.url
    else
      '/assets/app_icon.png'
    end
  end

  def url
    product_path(object) rescue nil
  end

  cached

  def cache_key
    object
  end
end
