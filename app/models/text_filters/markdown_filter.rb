module TextFilters
  class MarkdownFilter < HTML::Pipeline::TextFilter
    def initialize(text, context = {}, result = nil)
      super text, context, result
      @text = @text.gsub "\r", ''
      @renderer = Redcarpet::Render::HTML.new(context.fetch(:markdown, {}).merge(filter_html: false))
      @engine = Redcarpet::Markdown.new(
        @renderer,
        context.fetch(:redcarpet, {}).merge(autolink: true, lax_spacing: true)
      )
    end

    # Convert Markdown to HTML using the best available implementation
    # and convert into a DocumentFragment.
    def call
      html = @engine.render(@text)
      html.rstrip!
      html
    end
  end
end
