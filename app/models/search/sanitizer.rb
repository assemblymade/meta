module Search
  class Sanitizer
    include ActionView::Helpers::SanitizeHelper

    def sanitize(text)
      strip_tags markdown(text)
    end

    def markdown(text)
      Redcarpet::Markdown.new(Redcarpet::Render::HTML).render(text)
    end
  end
end