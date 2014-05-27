module SearchHelper
  def search_path
    if @product.persisted?
      polymorphic_path([@product, :search])
    else
      super
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