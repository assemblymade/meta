module TitleHelper

  SITE_TITLE = 'Assembly'
  TITLE_SEPARATOR = ' · '

  def title(*parts)
    parts << SITE_TITLE unless signed_in?
    provide(:title, parts.compact.join(TITLE_SEPARATOR))
  end

end
