module SearchHelper
  def scoped_search_path(*args)
    if @product.try(:persisted?)
      polymorphic_path([@product, :search])
    else
      search_path(args)
    end
  end

  def first_result(result, field)
     result.try(:highlight).try(field).try(:join).try(:html_safe) || result.try(field)
  end

  def ellipses_for_highlight(highlight, original)
    stripped = strip_tags(highlight).rstrip

    prefix = original.starts_with?(stripped) ? "" : "… "
    suffix = original.ends_with?(stripped) ? "" : " …"
    [prefix, highlight, suffix].join
  end
end