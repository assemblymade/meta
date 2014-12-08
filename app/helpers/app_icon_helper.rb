module AppIconHelper

  def app_icon(product, props={})
    size = props.fetch(:size, 24)
    retina_size = size * 2

    image_url = if product.logo.present?
      product.logo.url
    elsif product.poster.present?
      product.poster_image.url
    else
      image_url('app_icon.png')
    end

    image_tag(
      firesize(image_url, "#{retina_size}x#{retina_size}", 'g_center'),
      alt: product.name,
      width: size,
      height: size,
      class: 'app-icon'
    )
  end

  def raw_app_icon_url(product)
    image_url = if product.logo.present?
      product.logo.url
    elsif product.poster.present?
      product.poster_image.url
    else
      image_url('app_icon.png')
    end
  end

end
