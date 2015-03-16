module Search
  class Sanitizer
    include ActionView::Helpers::SanitizeHelper

    def sanitize(text)
      replace_html(strip_tags(markdown(text))).strip
    end

    def markdown(text)
      Redcarpet::Markdown.new(Redcarpet::Render::HTML).render(text)
    end

    def replace_html(text)
      HTMLEntities.new.decode(text).gsub('&quot;','"')
    end
  end
end
