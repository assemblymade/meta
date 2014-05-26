module SearchHelper
  def first_result(result, field)
     result.try(:highlight).try(field).try(:join) || result.try(field)
  end

  def ellipses_for_highlight(highlight, original)
    # raise original.inspect
    stripped = strip_tags(highlight).rstrip

    prefix = original.starts_with?(stripped) ? "" : "… "
    suffix = original.ends_with?(stripped) ? "" : " …"
    [prefix, highlight, suffix].join
  end
end