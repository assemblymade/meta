module Search
  class Sanitizer
    include ActionView::Helpers::SanitizeHelper

    def sanitize(text)
      HTMLEntities.new.decode(strip_tags(markdown(text))).strip
    end

    def markdown(text)
      Redcarpet::Markdown.new(Redcarpet::Render::HTML).render(text)
    end
  end
end