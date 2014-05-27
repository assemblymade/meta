module TextFilters
  class MarkdownFilter < HTML::Pipeline::TextFilter
    def initialize(text, context = {}, result = nil)
      super text, context, result
      @text = @text.gsub "\r", ''
      @engine = Redcarpet::Markdown.new(
        Redcarpet::Render::HTML.new(context.fetch(:markdown, {})),
        context.fetch(:redcarpet, {}).merge(autolink: true)
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
