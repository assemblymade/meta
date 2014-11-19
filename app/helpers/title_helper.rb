module TitleHelper

  SITE_TITLE = 'Assembly'
  TITLE_SEPARATOR = ' · '
  DESCRIPTION_CHARACTER_LIMIT = 140

  def title(*parts)
    parts << SITE_TITLE unless signed_in?
    provide(:title, parts.compact.join(TITLE_SEPARATOR))
  end

  def description(text)
    short_desc = truncate(text,
      length: DESCRIPTION_CHARACTER_LIMIT,
      separator: ' '
    )
    provide(:description, short_desc)
  end

end
