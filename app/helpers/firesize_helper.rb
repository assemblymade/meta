module FiresizeHelper
  def firesize(url, *args)
    File.join(firesize_url || '', args, URI.escape(url))
  end

  def firesize_img(url, width, height, *args)
    content_tag(:img,
      nil,
      src: firesize(url, "#{width}x#{height}", args),
      srcset: (firesize(url, "#{width * 2}x#{height * 2}", args) + ' 2x'),
      width: width,
      height: height
    ).html_safe
  end
end