class ProductShallowSerializer < ApplicationSerializer
  attributes :name, :slug, :logo_url, :url

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
    product_path(object)
  end

  cached

  def cache_key
    object
  end

end
