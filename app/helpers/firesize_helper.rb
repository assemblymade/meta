module FiresizeHelper
  def firesize(url, *args)
    File.join(firesize_url || '', args, URI.escape(url))
  end
end