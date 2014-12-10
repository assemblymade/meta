module FiresizeHelper
  def firesize(url, *args)
    if %w[.pdf .psd].include?(File.extname(url))
      args << ['frame_0']
    end

    File.join(ENV['FIRESIZE_URL'] || '', args, URI.escape(url))
  end

  def firesize_img(url, width, height, *args)
    if url != '/assets/app_icon.png'
      src = firesize(url, "#{width}x#{height}", args)
      srcset = firesize(url, "#{width * 2}x#{height * 2}", args) + ' 2x'
    else
      src = url
      srcset = url
    end

    content_tag(:img,
      nil,
      class: 'img-responsive',
      src: src,
      srcset: srcset
    ).html_safe
  end
end
