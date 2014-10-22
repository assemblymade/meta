class ProductSerializer < ApplicationSerializer

  attributes :url, :wips_url
  attributes :name, :pitch, :slug, :quality, :average_bounty, :logo_url

  def logo_url
    image_url = if object.logo.present?
      object.logo.url
    elsif object.poster.present?
      object.poster_image.url
    else
      '/assets/app_icon.png'
    end
  end

  def wips_url
    product_wips_path(object)
  end

  def url
    product_path(object)
  end

end
